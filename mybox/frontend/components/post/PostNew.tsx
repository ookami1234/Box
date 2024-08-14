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
import { createPost } from "@/actions/post";
import { Loader2 } from "lucide-react";
import { UserType } from "@/lib/nextauth";
import Image from "next/image";
import toast from "react-hot-toast";
import getChannelInfo from "@/lib/getChannelInfo";

const schema = z.object({
  title: z.string().min(3, { message: "3文字以上入力する必要があります" }),
  content: z.string().min(3, { message: "3文字以上入力する必要があります" }),
  channelId: z.string().nonempty({ message: "チャンネルIDを入力する必要があります" }),
});

type InputType = z.infer<typeof schema>;

interface PostNewProps {
  user: UserType;
}

const PostNew = ({ user }: PostNewProps) => {
  const router = useRouter();
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      channelId: "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      const channelId = value.channelId;
      if (channelId) {
        getChannelInfo(channelId).then((result) => {
          if (result.success && result.data && result.data.thumbnails) {
            setThumbnail(result.data.thumbnails.high.url);
          } else {
            setThumbnail(undefined); // サムネイルが見つからない場合
            toast.error(result.error || "チャンネル情報の取得に失敗しました");
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit: SubmitHandler<InputType> = async (data) => {
    setIsLoading(true);

    try {
      const res = await createPost({
        accessToken: user.accessToken,
        title: data.title,
        content: data.content,
        image: thumbnail,  // サムネイル画像のURLを渡す
        channelId: data.channelId,
      });

      if (!res.success || !res.post) {
        toast.error("投稿に失敗しました");
        return;
      }

      toast.success("投稿が成功しました");
      router.push(`/post/${res.post.uid}`);
      router.refresh();
    } catch (error) {
      toast.error("投稿に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-2xl font-bold text-center mb-5">新規投稿</div>
      <Form {...form}>
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

          {thumbnail && (
            <div className="mt-5">
              <FormLabel>サムネイル</FormLabel>
              <div className="aspect-[16/9] relative">
                <Image
                  fill
                  src={thumbnail}
                  alt="thumbnail"
                  className="object-cover rounded-md"
                />
              </div>
            </div>
          )}

          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            投稿
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PostNew;
