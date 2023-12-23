import { useNavigate } from "react-router-dom";
import { FaHouse } from "react-icons/fa6";
import { IoLogOut, IoLogIn } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { useContext } from "react";
import AuthContext from "context/AuthContext";
import { getAuth, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { app } from "firebaseApp";

export default function MenuList() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <div className="footer">
      <div className="footer__grid">
        <button type="button" onClick={() => navigate("/")}>
          <FaHouse />
          Home
        </button>
        <button type="button" onClick={() => navigate("/profile")}>
          <FaCircleUser />
          Profile
        </button>
        {user === null ? (
          <button type="button" onClick={() => navigate("/users/login")}>
            <IoLogIn />
            LogIn
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
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
