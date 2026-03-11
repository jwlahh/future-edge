import { useNavigate } from "react-router-dom";
function Signup(){
const navigate = useNavigate();
return(

<section id="signup" className="signup">

<h2><span>Start Building Your Career Today</span></h2>

<p>
Upload your resume, analyze your skills, and discover
the right career path with FutureEdge.
</p>

<div className="signup-buttons">

<button
className="primary-btn"
onClick={() => navigate("/signup")}
>
Create free account
</button>



</div>

</section>

)

}

export default Signup