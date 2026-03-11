function Logos(){

const logos = [
"MIT","Stanford","VIT","SRM","IIT","GITAM"
]

return(

<section className="logos">



<div className="logo-row">

{logos.map((logo,index)=>(
<span key={index}>{logo}</span>
))}

</div>

</section>

)

}

export default Logos