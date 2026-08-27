import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import './Login.scss';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { loginRequest } from "../../Utils/authConfig";


const Login = () => {
  const {instance} = useMsal();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if(isAuthenticated){
      navigate("/home");
    }
  },[isAuthenticated,navigate])

  const handleLogin = async () => {
    const response = await instance.loginPopup(loginRequest);
    console.log(response,'response')
    if(response.accessToken){
      navigate("/home")
    }
  }
  
  return (
    <>
      <div className="login-background">
        <div className="login-container">
          <button className="login-btn" onClick={handleLogin}>Login</button>
        </div>
      </div>
    </>
  );
};

export default Login;
