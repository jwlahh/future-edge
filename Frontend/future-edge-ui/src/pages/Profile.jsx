import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom"; // 🔥 added
import "../styles/profile.css";
import bgImage from "../assets/clouds.png";

function Profile() {
  const [user, setUser] = useState(null);

  const navigate = useNavigate(); // 🔥 added

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    country_code: "+91",
    education: "",
    linkedin: "",
    avatar_url: "",
  });

  const phoneLengthMap = {
    "+91": 10,
    "+1": 10,
    "+44": 11,
    "+61": 9,
    "+81": 10,
    "+49": 11,
    "+33": 9,
    "+971": 9,
    "+86": 11,
  };

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${user.id}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (error) {
      alert("Upload failed");
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    setFormData({ ...formData, avatar_url: data.publicUrl });
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
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="profile" />
            ) : (
              <span>
                {formData.first_name
                  ? formData.first_name[0].toUpperCase()
                  : "U"}
              </span>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
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

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                name="first_name"
                value={formData.first_name || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                name="last_name"
                value={formData.last_name || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Phone Number (Max {phoneLengthMap[formData.country_code] || 10} digits)
            </label>

            <div className="phone-wrapper">

              <select
                className="country-code"
                name="country_code"
                value={formData.country_code || "+91"}
                onChange={handleChange}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+33">🇫🇷 +33</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+86">🇨🇳 +86</option>
              </select>

              <input
                name="phone"
                value={formData.phone || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const maxLength =
                    phoneLengthMap[formData.country_code] || 10;

                  if (value.length <= maxLength) {
                    setFormData({ ...formData, phone: value });
                  }
                }}
              />

            </div>
          </div>

          <div className="form-group">
            <label>Highest Education</label>
            <input
              name="education"
              value={formData.education || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>LinkedIn Profile</label>
            <input
              name="linkedin"
              value={formData.linkedin || ""}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* 🔥 Buttons */}
        <div className="profile-actions">
          <button
            className="cancel-btn"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/dashboard");
              }
            }}
          >
            Cancel
          </button>

          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}

export default Profile;