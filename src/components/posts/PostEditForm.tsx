import { useCallback, useContext, useEffect, useState } from "react";
import React from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FiImage } from "react-icons/fi";
import { db, storage } from "firebaseApp";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { PostProps } from "pages/home";
import { v4 as uuidv4 } from "uuid";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import AuthContext from "context/AuthContext";
import PostHeader from "./Header";

export default function PostEditForm() {
  const params = useParams();
  const [post, setPost] = useState<PostProps | null>(null);
  const [content, setContent] = useState<string>("");
  const navigate = useNavigate();
  const [hashTag, setHashTag] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = useContext(AuthContext);

  const handleFileUpload = (e: any) => {
    const {
      target: { files },
    } = e;
    console.log(files);

    const file = files?.[0];
    const fileReader = new FileReader();
    fileReader?.readAsDataURL(file);

    fileReader.onloadend = (e: any) => {
      const { result } = e?.currentTarget;
      setImageFile(result);
    };
  };

  const getPost = useCallback(async () => {
    if (params.id) {
      const docRef = doc(db, "posts", params.id);
      const docSnap = await getDoc(docRef);
      setPost({ ...(docSnap?.data() as PostProps), id: docSnap.id });
      setContent(docSnap?.data()?.content);
      setTags(docSnap?.data()?.hashTags);
      setImageFile(docSnap?.data()?.imageUrl);
    }
  }, [params.id]);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    const key = `${user?.uid}/${uuidv4()}`;
    const storageRef = ref(storage, key);
    try {
      if (post) {
        //기존 사진 지우고 새로운 사진 업로드
        if (post?.imageUrl) {
          let imageRef = ref(storage, post?.imageUrl);
          await deleteObject(imageRef).catch((error) => {
            console.log(error);
          });
        }
        //이미지 먼저 업로드

        let imageUrl = "";
        if (imageFile) {
          console.log(imageFile);
          const data = await uploadString(storageRef, imageFile, "data_url");
          imageUrl = await getDownloadURL(data?.ref);
        }

        const postRef = doc(db, "posts", post.id);
        await updateDoc(postRef, {
          content: content,
          hashTags: tags,
          imageUrl: imageUrl,
        });
        navigate(`/posts/${post?.id}`);
        toast.success("게시글을 수정했습니다..");
      }
      setImageFile(null);
      setIsSubmitting(false);
    } catch (e: any) {
      console.log(e);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {
      target: { name, value },
    } = e;

    if (name === "content") {
      setContent(value);
    }
  };
  const handleDeleteImage = () => {
    setImageFile(null);
  };
  useEffect(() => {
    if (params.id) getPost();
  }, [getPost]);
  const handleKeyUp = (e: any) => {
    if (e.keyCode === 32 && e.target.value.trim() !== "") {
      //같은 태그가 있다면 에러
      //태그 생성
      if (tags?.includes(e.target.value?.trim())) {
        toast.error("같은 태그가 있습니다.");
      } else {
        setTags((prev) => (prev?.length > 0 ? [...prev, hashTag] : [hashTag]));
        setHashTag("");
      }
    }
  };

  const onChangeHashTag = (e: any) => {
    setHashTag(e?.target?.value.trim());
  };

  const removeTag = (tag: string) => {
    setTags(tags?.filter((val) => val !== tag));
  };
  return (
    <>
      <div className="post">
        <PostHeader />
      </div>
      <form className="post-form" onSubmit={onSubmit}>
        <textarea
          className="post-form__textarea"
          required
          name="content"
          id="content"
          placeholder="What is happening?"
          onChange={onChange}
          value={content}
        />
        <div className="post-form__hashtags">
          <span className="post-form__hashtags-outputs">
            {tags?.map((tag, index) => (
              <span
                className="post-form__hashtags-tag"
                key={index}
                onClick={() => removeTag(tag)}
              >
                #{tag}
              </span>
            ))}
          </span>
          <input
            className="post-form__input"
            name="hashtag"
            id="hashtag"
            placeholder="해시태그 + 스페이스바 입력"
            onChange={onChangeHashTag}
            onKeyUp={handleKeyUp}
            value={hashTag}
          />
        </div>
        <div className="post-form__submit-area">
          <div className="post-form__image-area">
            <label htmlFor="file-input" className="post-form__file">
              <FiImage className="post-form__file-icon" />
            </label>
            <input
              type="file"
              name="file-input"
              id="file-input"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {imageFile && (
              <div className="post-form__attachment">
                <img
                  src={imageFile}
                  alt="attachment"
                  width={100}
                  height={100}
                />
                <button
                  className="post-form__clear-btn"
                  type="button"
                  onClick={handleDeleteImage}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <input
            type="submit"
            value="수정"
            className="post-form__submit-btn"
            disabled={isSubmitting}
          />
        </div>
      </form>
    </>
  );
}
