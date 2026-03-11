import { useNavigate } from "react-router-dom";

function Navbar() {

const navigate = useNavigate();

return(

<nav className="navbar">

<div className="logo">FutureEdge</div>

<ul className="nav-links">

<li>
<a href="#home">Home</a>
</li>

<li>
<a href="#about">About</a>
</li>

<li>
<a href="#features">Features</a>
</li>

</ul>

<div className="nav-buttons">

<button
className="start-btn"
onClick={()=>navigate("/SignUp")}
>
SignUp
</button>

<button
className="start-btn"
onClick={()=>navigate("/login")}
>
Login
</button>



</div>

</nav>

)

}

export default Navbar;