import { useContext, useState } from "react";
import React from "react";
import { collection, addDoc } from "firebase/firestore";
import { FiImage } from "react-icons/fi";
import { db, storage } from "firebaseApp";
import { toast } from "react-toastify";
import AuthContext from "context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

export default function PostForm() {
  const [content, setContent] = useState<string>("");
  const [hashTag, setHashTag] = useState<string>("");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = useContext(AuthContext);
  const [tags, setTags] = useState<string[]>([]);

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

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const key = `${user?.uid}/${uuidv4()}`;
    const storageRef = ref(storage, key);
    setIsSubmitting(true);
    try {
      //이미지 먼저 업로드
      let imageUrl = "";
      if (imageFile) {
        const data = await uploadString(storageRef, imageFile, "data_url");
        imageUrl = await getDownloadURL(data?.ref);
      }
      //업로드된 이미지의 다운로드 url업데이트

      await addDoc(collection(db, "posts"), {
        content: content,
        createdAt: new Date()?.toLocaleDateString("ko", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        uid: user?.uid,
        email: user?.email,
        hashTags: tags,
        imageUrl: imageUrl,
      });
      setTags([]);
      setHashTag("");
      setContent("");
      setImageFile(null);
      toast.success("글 등록이 완료되었습니다.");
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

  const handleDeleteImage = () => {
    setImageFile(null);
  };

  return (
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
              <img src={imageFile} alt="attachment" width={100} height={100} />
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
          value="Tweet"
          className="post-form__submit-btn"
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}
