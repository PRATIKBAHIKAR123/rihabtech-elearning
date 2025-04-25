

// This component contains just the two sections shown in the image
const CareerSkillsSections = () => {
    const careerSkills = [
        { id: 1, title: "Industry Experts", description: "Comprehensive self-paced courses created with top practitioners" ,icon:'Images/icons/skill.png'},
        { id: 2, title: "Free Resources", description: "Free guides on career paths, salaries, interview tips, and more",icon:'Images/icons/cloud.png' },
        { id: 3, title: "Skill-based Learning", description: "600+ job-ready skills on offer in today's most in-demand domains",icon:'Images/icons/edu gears.png' },
        { id: 4, title: "Anytime, Anywhere", description: "Learn while working or studying from any place, across any device",icon:'Images/icons/Container (4).png' },
    ];
  return (
    <>
      {/* Career Skills Section */}
      <section className="py-16 bg-[#F4F4F4]">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-16">
            Courses Focused On Building Strong Foundational<br />
            Skills For Career Growth
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            {careerSkills.map((skill,index)=>(<div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-6 text-orange-500">
                <img src={skill.icon} alt="Skill Icon" className="w-full h-full" />
              </div>
              <h3 className="text-xl font-bold mb-3">{skill.title}</h3>
              <p className="text-[#666666] text-xl font-normal font-['Barlow'] leading-[30px]">
                {skill.description}
              </p>
            </div>))}
            
          </div>
        </div>
      </section>
      
    </>
  );
};

export default CareerSkillsSections;