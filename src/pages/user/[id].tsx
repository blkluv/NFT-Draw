import { ErrorPage } from "@/components/error-page";
import { Layout } from "@/components/layout";
import { LoadingCard } from "@/components/post/loading-card";
import { PostCard } from "@/components/post/post-card";
import { PostsGrid } from "@/components/post/posts-grid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/use-translations";
import { api } from "@/utils/api";
import { formatUserJoinedString } from "@/utils/helpers";
import { type NextPage } from "next";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";

const LIMIT = 8;

const Profile: NextPage = () => {
  const { t, currentLanguage } = useTranslation();
  const router = useRouter();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = api.user.getById.useQuery(
    {
      id: String(router.query.id),
    },
    {
      retry(_failureCount, error) {
        if (error.data?.code === "NOT_FOUND") return false;
        return true;
      },
    },
  );

  if (isError)
    return (
      <ErrorPage
        title={error.data?.code === "NOT_FOUND" ? "404" : t.errorMessages.error}
        description={
          error.data?.code === "NOT_FOUND"
            ? t.errorMessages.notFound
            : t.errorMessages.getProfileError
        }
      >
        {error.data?.code === "NOT_FOUND" ? (
          <Button onClick={() => router.push("/")}>
            {t.errorMessages.goHome}
          </Button>
        ) : (
          <Button onClick={() => signOut()}>{t.errorMessages.tryAgain}</Button>
        )}
      </ErrorPage>
    );

  return (
    <Layout>
      <div className="mb-12 flex flex-row space-x-6">
        {isLoading ? (
          <>
            <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="grid gap-1">
              <div className="h-6 w-64 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </>
        ) : (
          <>
            <Image
              className="h-16 w-16 rounded-full"
              src={user.image}
              alt="User profile"
              width={64}
              height={64}
            />
            <div className="grid gap-1">
              <h1 className="text-2xl font-bold tracking-wide">{user.name}</h1>
              <p className="text-slate-600 dark:text-slate-400">
                {formatUserJoinedString(
                  t.profile.joined,
                  currentLanguage,
                  user.createdAt,
                )}
              </p>
            </div>
          </>
        )}
      </div>
      <Tabs defaultValue="drawings">
        <TabsList>
          <TabsTrigger value="drawings">{t.profile.drawings}</TabsTrigger>
          <TabsTrigger value="liked">{t.profile.likedDrawings}</TabsTrigger>
        </TabsList>
        <TabsContent value="drawings" className="border-0 p-0">
          {!isLoading && user.posts?.length === 0 && (
            <p className="mt-3 text-xl font-semibold tracking-tight text-slate-500">
              {t.errorMessages.noPostsYet}
            </p>
          )}
          <PostsGrid>
            {isLoading ? (
              <>
                {Array(LIMIT)
                  .fill(1)
                  .map((_, idx) => (
                    <LoadingCard key={`${idx}-loader`} />
                  ))}
              </>
            ) : (
              <>
                {user.posts
                  .sort((a, b) => Number(b.pinned) - Number(a.pinned))
                  .map((post) => (
                    <PostCard key={post.id} post={post} showPinned />
                  ))}
              </>
            )}
          </PostsGrid>
        </TabsContent>
        <TabsContent value="liked" className="border-0 p-0">
          {!isLoading && user.likes?.length === 0 && (
            <p className="mt-3 text-xl font-semibold tracking-tight text-slate-500">
              {t.errorMessages.noLikesYet}
            </p>
          )}
          <PostsGrid>
            {isLoading ? (
              <>
                {Array(LIMIT)
                  .fill(1)
                  .map((_, idx) => (
                    <LoadingCard key={`${idx}-loader`} />
                  ))}
              </>
            ) : (
              <>
                {user.likes.map((like) => (
                  <PostCard
                    key={`${like.postId}-${like.userId}`}
                    post={like.post}
                  />
                ))}
              </>
            )}
          </PostsGrid>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Profile;
