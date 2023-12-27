import AuthContext from "context/AuthContext";
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "firebaseApp";
import { PostProps } from "pages/home";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface FollowingProps {
  post: PostProps;
}

interface UserProps {
  id: string;
}

export default function FollowingBox({ post }: FollowingProps) {
  const { user } = useContext(AuthContext);

  const [postFollower, setPostFollowers] = useState<any>([]);

  const onClickFollow = async (e: any) => {
    e.preventDefault();

    try {
      if (user?.uid) {
        //내가 주체가 되어 생성 업데이트
        const followingRef = doc(db, "following", user?.uid);
        await setDoc(
          followingRef,
          {
            users: arrayUnion({ id: post?.uid }),
          },
          { merge: true }
        );

        //내가 당함
        const followerRef = doc(db, "follower", post?.uid);

        await setDoc(
          followerRef,
          { users: arrayUnion({ id: user?.uid }) },
          { merge: true }
        );
        toast.success("팔로우를 했습니다.");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onClickDeleteFollow = async (e: any) => {
    e.preventDefault();
    try {
      if (user?.uid) {
        const followingRef = doc(db, "following", user?.uid);
        await updateDoc(followingRef, {
          users: arrayRemove({ id: post?.uid }),
        });

        const followerRef = doc(db, "follower", post?.uid);
        await updateDoc(followerRef, {
          users: arrayRemove({ id: user.uid }),
        });
        toast.success("팔로우를 취소했습니다.");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getFollowers = useCallback(async () => {
    if (post.uid) {
      const ref = doc(db, "follower", post.uid);
      onSnapshot(ref, (doc) => {
        setPostFollowers([]);
        doc
          ?.data()
          ?.users?.map((user: UserProps) =>
            setPostFollowers((prev: UserProps[]) =>
              prev ? [...prev, user?.id] : []
            )
          );
      });
    }
  }, []);

  useEffect(() => {
    if (post.uid) getFollowers();
  }, [getFollowers]);

  return (
    <>
      {user?.uid !== post?.uid &&
        (postFollower?.includes(user?.uid) ? (
          <button className="post__following-btn" onClick={onClickDeleteFollow}>
            Following
          </button>
        ) : (
          <button className="post__follow-btn" onClick={onClickFollow}>
            Follower
          </button>
        ))}
    </>
  );
}
