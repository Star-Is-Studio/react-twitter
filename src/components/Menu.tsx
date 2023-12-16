import { useNavigate } from "react-router-dom";
import { FaHouse } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";

export default function MenuList() {
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
        <button type="button" onClick={() => navigate("/")}>
          <IoLogOut />
          Logout
        </button>
      </div>
    </div>
  );
}
