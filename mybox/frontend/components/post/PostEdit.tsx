"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PostType, updatePost } from "@/actions/post";
import { Loader2 } from "lucide-react";
import { UserType } from "@/lib/nextauth";
import ImageUploading, { ImageListType } from "react-images-uploading";
import Image from "next/image";
import toast from "react-hot-toast";
import getLatestVideo, { VideoItem } from "@/lib/getLatestVideo";

const schema = z.object({
  title: z.string().min(3, { message: "3文字以上入力する必要があります" }),
  content: z.string().min(3, { message: "3文字以上入力する必要があります" }),
  channelId: z.string().nonempty({ message: "チャンネルIDを入力する必要があります" }),
});

type InputType = z.infer<typeof schema>;

interface PostEditProps {
  user: UserType;
  post: PostType;
}

const PostEdit = ({ user, post }: PostEditProps) => {
  const router = useRouter();
  const [imageUpload, setImageUpload] = useState<ImageListType>([
    {
      dataURL: post.image || "/noImage.png",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [latestVideos, setLatestVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (post.channelId) {
      getLatestVideo(post.channelId).then((result) => {
        if (result.success && result.videos) {
          setLatestVideos(result.videos);
        } else {
          toast.error("最新動画の取得に失敗しました");
        }
      });
    }
  }, [post.channelId]);

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post.title || "",
      content: post.content || "",
      channelId: post.channelId || "",
    },
  });

  const onSubmit: SubmitHandler<InputType> = async (data) => {
    setIsLoading(true);
    let base64Image;

    if (
      imageUpload[0].dataURL &&
      imageUpload[0].dataURL.startsWith("data:image")
    ) {
      base64Image = imageUpload[0].dataURL;
    }

    try {
      const res = await updatePost({
        accessToken: user.accessToken,
        postId: post.uid,
        title: data.title,
        content: data.content,
        image: base64Image,
        channelId: data.channelId,
      });

      if (!res.success) {
        toast.error("投稿の編集に失敗しました");
        return;
      }

      toast.success("投稿を編集しました");
      router.push(`/post/${post.uid}`);
      router.refresh();
    } catch (error) {
      toast.error("投稿の編集に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeImage = (imageList: ImageListType) => {
    const file = imageList[0]?.file;
    const maxFileSize = 2 * 1024 * 1024;

    if (file && file.size > maxFileSize) {
      toast.error("ファイルサイズは2MBを超えることはできません");
      return;
    }

    setImageUpload(imageList);
  };

  return (
    <div>
      <div className="text-2xl font-bold text-center mb-5">投稿編集</div>
      <Form {...form}>
        <div className="mb-5">
          <FormLabel>サムネイル</FormLabel>
          <div className="mt-2">
            <ImageUploading
              value={imageUpload}
              onChange={onChangeImage}
              maxNumber={1}
              acceptType={["jpg", "png", "jpeg"]}
            >
              {({ imageList, onImageUpdate }) => (
                <div className="w-full">
                  {imageList.map((image, index) => (
                    <div key={index}>
                      {image.dataURL && (
                        <div className="aspect-[16/9] relative">
                          <Image
                            fill
                            src={image.dataURL}
                            alt="thumbnail"
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {imageList.length > 0 && (
                    <div className="text-center mt-3">
                      <Button
                        variant="outline"
                        onClick={() => onImageUpdate(0)}
                      >
                        画像を変更
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ImageUploading>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>タイトル</FormLabel>
                <FormControl>
                  <Input placeholder="投稿のタイトル" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>内容</FormLabel>
                <FormControl>
                  <Textarea placeholder="投稿の内容" {...field} rows={15} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="channelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>チャンネルID</FormLabel>
                <FormControl>
                  <Input placeholder="チャンネルIDを入力" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            編集
          </Button>
        </form>
      </Form>

      {latestVideos.length > 0 && (
        <div className="mt-10">
          <h2>最新動画</h2>
          {latestVideos.map((video, index) => (
            <div key={index} className="mb-4">
              <p>タイトル: {video.snippet.title}</p>
              <p>説明: {video.snippet.description}</p>
              <a href={`https://www.youtube.com/watch?v=${video.id.videoId}`} target="_blank" rel="noopener noreferrer">
                動画を見る
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostEdit;
