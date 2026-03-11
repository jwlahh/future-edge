function Features(){

const features = [

{
title:"Resume Analysis",
desc:"Upload your resume and receive AI-powered feedback on structure, formatting, keywords, and overall effectiveness."
},

{
title:"ATS Score",
desc:"Check whether your resume is ATS-friendly. Identify formatting and keyword issues and get suggestions to improve your resume."
},

{
title:"Career Recommendation",
desc:"Get personalized career suggestions based on your skills, experience, and interests."
},

{
title:"Skill Gap Analysis",
desc:"Identify the missing skills required for your desired job roles and get recommendations on how to improve."
},

{
title:"Mock Tests",
desc:"Practice technical and aptitude mock tests designed to prepare you for real placement and recruitment assessments."
}

]

return(

<section id="features" className="features">

<h2><span>Platform Features</span></h2>

<div className="feature-grid">

{features.map((feature,index)=>(

<div className="feature-card" key={index}>

<h3>{feature.title}</h3>
<p>{feature.desc}</p>

</div>

))}

</div>

</section>

)

}

export default Features