
import { useAuthActions } from "../auth/useAuthActions";

export const useAuthSignOut = () => {
  const { signOut } = useAuthActions();

  return {
    handleSignOut: signOut
  };
};
