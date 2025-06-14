
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "../auth/useAuthActions";

export const useAuthSignOut = () => {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      navigate("/");
    }
  };

  return {
    handleSignOut
  };
};
