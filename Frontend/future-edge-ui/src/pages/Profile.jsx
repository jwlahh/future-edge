import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/profile.css";
import bgImage from "../assets/clouds.png";

function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    education: "",
    linkedin: "",
  });

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    const currentUser = data.user;
    setUser(currentUser);

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", currentUser.id)
      .single();

    if (userData) {
      setFormData(userData);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await supabase
      .from("users")
      .update(formData)
      .eq("id", user.id);

    alert("Profile updated!");
  };

  return (
    <div
      className="profile-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="profile-card">

        {/* Header */}
        <div className="profile-header">
          <div className="avatar">
            {formData.first_name
              ? formData.first_name[0].toUpperCase()
              : "U"}
          </div>

          <div>
            <h2>
              {formData.first_name || "Your"} {formData.last_name || "Name"}
            </h2>
            <p>{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="profile-form">

          {/* First + Last */}
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                name="first_name"
                value={formData.first_name || ""}
                onChange={handleChange}
                placeholder="First name"
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                name="last_name"
                value={formData.last_name || ""}
                onChange={handleChange}
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label>Phone Number</label>
            <input
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </div>

          {/* Education */}
          <div className="form-group">
            <label>Highest Education</label>
            <input
              name="education"
              value={formData.education || ""}
              onChange={handleChange}
              placeholder="Your qualification"
            />
          </div>

          {/* LinkedIn */}
          <div className="form-group">
            <label>LinkedIn Profile</label>
            <input
              name="linkedin"
              value={formData.linkedin || ""}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

        </div>

        {/* Buttons */}
        <div className="profile-actions">
          <button className="cancel-btn">Cancel</button>
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}

export default Profile;