import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";
import bgImage from "../assets/clouds.png";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);

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

    if (!currentUser) return;

    setUser(currentUser);

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", currentUser.id)
      .single();

    if (userData) {
      const formattedData = {
        first_name: userData.first_name || userData.First_name || "",
        last_name: userData.last_name || userData.Last_Name || "",
        phone: userData.phone || "",
        country_code: userData.country_code || "+91",
        education: userData.education || "",
        linkedin: userData.linkedin || "",
        avatar_url: userData.avatar_url || "",
      };

      setFormData(formattedData);
      setOriginalData(formattedData);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File too large (max 2MB)");
      return;
    }

    const fileName = `${user.id}/avatar-${Date.now()}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error("UPLOAD ERROR:", error);
      alert(error.message);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    setFormData((prev) => ({
      ...prev,
      avatar_url: data.publicUrl,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({
        First_name: formData.first_name,
        Last_Name: formData.last_name,
        phone: formData.phone,
        country_code: formData.country_code,
        education: formData.education,
        linkedin: formData.linkedin,
        avatar_url: formData.avatar_url,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setOriginalData(formData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    }
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
        <button
          className="dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          ⬅ Back to Dashboard
        </button>

        {/* Header */}
        <div className="profile-header">

          {/* Avatar */}
          <div
            className="avatar"
            onClick={() =>
              isEditing && document.getElementById("fileInput").click()
            }
          >
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="profile" />
            ) : (
              <span>
                {formData.first_name
                  ? formData.first_name[0].toUpperCase()
                  : "U"}
              </span>
            )}

            {isEditing && (
              <>
                <div className="avatar-overlay">✏️</div>

                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </>
            )}
          </div>

          {/* Name + Email */}
          <div>
            <h2>
              {formData.first_name || "Your"} {formData.last_name || "Name"}
            </h2>
            <p>{user?.email}</p>
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <button
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Form */}
        <div className="profile-form">

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={!isEditing}
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
                value={formData.country_code}
                onChange={handleChange}
                disabled={!isEditing}
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
                value={formData.phone}
                disabled={!isEditing}
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
              value={formData.education}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>LinkedIn Profile</label>
            <input
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

        </div>

        {/* Buttons */}
        {isEditing && (
          <div className="profile-actions">

            <button
              className="cancel-btn"
              onClick={() => {
                setFormData(originalData);
                setIsEditing(false);
              }}
            >
              Cancel
            </button>

            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
export default Profile;