import { RefreshCcwDot } from 'lucide-react'
import { getUsers } from '../APIs/UserAPIs'
import { toast } from 'react-toastify'
function RefreshToken() {
  const user = JSON.parse(localStorage.getItem("OrbisUser"));

  return (
    <RefreshCcwDot
      className="flex flex-auto cursor-pointer border-1 border-gray-500 rounded-sm"
      onClick={async () => {
        try {
          const response = await getUsers(user.id);

          if (response.id) {
            localStorage.setItem("OrbisUser", JSON.stringify(response));
            console.log(response)

            // ✅ Notify parent

            toast.success("User Data Refreshed");
          } else {
            toast.error("Failed To refresh User Data");
          }
        } catch (error) {
          console.error(error);
          toast.error("Error refreshing user data");
        }
      }}
    />
  );
}


export default RefreshToken