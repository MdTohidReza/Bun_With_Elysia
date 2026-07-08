import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-bold text-lg text-indigo-600">
          BlogApp
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-indigo-600">
            Posts
          </Link>
          {user && (
            <Link to="/posts/new" className="hover:text-indigo-600">
              Write
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className="hover:text-indigo-600">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="hover:text-indigo-600">
                {user.name || user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-slate-800 text-white px-3 py-1.5 rounded-md hover:bg-slate-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-indigo-600">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
