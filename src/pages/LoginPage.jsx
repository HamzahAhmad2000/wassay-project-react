import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, verifyToken } from "/src/APIs/TokenAPIs";
import { toast } from "react-toastify";
import { User, Lock, LoaderCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Label } from "../../../components/ui/label";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hide, setHide] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("OrbisAccessToken"));
  const [error, setError] = useState("");
  // const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Temporarily comment out authentication logic to test
  /*
  useEffect(() => {
    if (token) {
      verifyToken(token)
        .then(() => {
          if(user.role.name == "cashier" )
          navigate('/add-cashier-receipt')
          else
            navigate("/");
        })
        .catch(() => {
          toast.error("Invalid Credentials. Try Again.");
        });
    }
  }, [navigate, token]);
  */

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Temporary test login - just navigate to home
    setTimeout(() => {
      navigate("/");
      setLoading(false);
    }, 1000);

    /* Original login logic - commented out for testing
    try {
      const data = await loginUser(username, password);
      setToken(data.access);
      if (data.access) {
        localStorage.setItem("OrbisAccessToken", data.access);
        localStorage.setItem("OrbisRefreshToken", data.refresh);
        localStorage.setItem("OrbisUser", JSON.stringify(data.user));
        if(data.user.role.name == "cashier" )
          navigate('/add-cashier-receipt')
        else
          navigate("/");
      }
    } catch (err) {
      console.error("Error logging in: " + err.message);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
    */
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-secondary-900 dark:to-secondary-800 p-4">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        Skip to main content
      </a>
      <Card className="w-full max-w-md shadow-xl" id="main-content">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby="username-error"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="password"
                  type={hide ? "password" : "text"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 pr-10"
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setHide((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                  aria-label={hide ? "Show password" : "Hide password"}
                >
                  {hide ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription id="login-error">{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4 mr-2" />
                  Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
