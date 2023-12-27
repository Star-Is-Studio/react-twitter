import { useNavigate } from "react-router-dom";
import { FaHouse } from "react-icons/fa6";
import { IoLogOut, IoLogIn } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { AiOutlineSearch } from "react-icons/ai";
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { app } from "firebaseApp";
import { IoMdNotifications, IoMdNotificationsOutline } from "react-icons/io";
import useTranslation from "hooks/useTranslation";

export default function MenuList() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <div className="footer">
      <div className="footer__grid">
        <button type="button" onClick={() => navigate("/")}>
          <FaHouse />
          {t("MENU_HOME")}
        </button>
        <button type="button" onClick={() => navigate("/profile")}>
          <FaCircleUser />
          {t("MENU_PROFILE")}
        </button>
        <button type="button" onClick={() => navigate("/search")}>
          <AiOutlineSearch />
          {t("MENU_SEARCH")}
        </button>
        <button type="button" onClick={() => navigate("/notifications")}>
          <IoMdNotificationsOutline />
          {t("MENU_NOTI")}
        </button>
        {user === null ? (
          <button type="button" onClick={() => navigate("/users/login")}>
            <IoLogIn />
            {t("MENU_LOGIN")}
          </button>
        ) : (
          <button
            type="button"
            onClick={async () => {
              const auth = getAuth(app);
              await signOut(auth);
              toast.success("로그아웃 되었습니다.");
            }}
          >
            <IoLogOut />
            {t("MENU_LOGOUT")}
          </button>
        )}
      </div>
    </div>
  );
}
