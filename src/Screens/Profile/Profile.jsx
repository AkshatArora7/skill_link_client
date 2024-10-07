import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db, storage } from '../../firebaseConfig'; // Make sure to import storage
import { useAuth } from '../../authContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import necessary functions from Firebase Storage
import NavBar from '../../components/NavBar';
import Loading from '../../components/Loading';
import RoleOptionsDropdown from '../../components/ProfileRoleOptions';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePic: '',
    roles: [],
  });
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newRate, setNewRate] = useState('');
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) return;

      try {
        const docRef = doc(db, 'clients', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const clientData = docSnap.data();
          const rolesWithNames = await Promise.all(
            clientData.roles.map(async (role) => {
              const roleDoc = await getDoc(doc(db, 'professions', role.role));
              return {
                ...role,
                roleName: roleDoc.exists() ? roleDoc.data().name : 'Unknown Role',
              };
            })
          );
          setProfileData({ ...clientData, roles: rolesWithNames });
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
      setLoading(false);
    };

    fetchProfileData();
  }, [currentUser]);

  const handleEditRate = (index) => {
    setEditingIndex(index);
    setNewRate(profileData.roles[index].rate);
  };

  const handleRateChange = (index) => {
    const updatedRoles = [...profileData.roles];
    updatedRoles[index].rate = newRate;
    setProfileData({ ...profileData, roles: updatedRoles });
    setEditingIndex(null);
  };

  const handleRoleToggle = (index) => {
    const updatedRoles = [...profileData.roles];
    updatedRoles[index].isActive = !updatedRoles[index].isActive;
    setProfileData({ ...profileData, roles: updatedRoles });
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file); // Store the new file
      setProfileData((prevData) => ({
        ...prevData,
        profilePic: URL.createObjectURL(file), // Preview of the selected picture
      }));
    }
  };

  const handleRemoveRole = (index) => {
    const updatedRoles = profileData.roles.filter((_, i) => i !== index);
    setProfileData({ ...profileData, roles: updatedRoles });
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true)
    let profilePicUrl = profileData.profilePic;

    if (newProfilePic) {
      const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
      try {
        // Upload the file to Firebase Storage
        await uploadBytes(storageRef, newProfilePic);
        // Get the download URL
        profilePicUrl = await getDownloadURL(storageRef);
        console.log('Profile picture uploaded successfully:', profilePicUrl);
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        setIsSaving(false);  // Hide loading if there's an error
        return; // Stop execution if upload fails
      }
    }

    try {
      const docRef = doc(db, 'clients', currentUser.uid);
      await updateDoc(docRef, {...profileData,
        profilePic: profilePicUrl
      });
      setNewProfilePic(null);

      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
    }finally{
      setIsSaving(false)
    }
  };

  if (loading) {
    return <Loading />;
  }

  if(isSaving){
    return <Loading/>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar tab={'profile'} />
      <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-md mt-6">
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>

        <div className="mb-6 flex justify-center">
          <div className="relative">
            <input type="file" onChange={handleProfilePicChange} className="hidden" id="profilePic" />
            <label htmlFor="profilePic" className="cursor-pointer">
              <img
                src={profileData.profilePic || 'default-profile.png'}
                alt="Profile Pic"
                className="h-32 w-32 object-cover rounded-full border-2 border-gray-300"
              />
            </label>
            <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1">
              Edit
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={profileData.firstName}
            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={profileData.lastName}
            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profileData.email}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
          />
        </div>

        <h3 className="text-lg font-semibold mb-2 mt-6">Roles</h3>
        <div className="flex flex-col space-y-4">
          {/* Header Row */}
          <div className="grid grid-cols-4 gap-4 bg-gray-200 p-4 rounded-md">
            <span className="text-gray-700 font-extrabold">Name</span>
            <span className="text-gray-700 font-extrabold text-center">Rate</span>
            <span className="text-gray-700 font-extrabold text-center">Status</span>
            <span className="text-gray-700 font-extrabold text-right">Options</span>
          </div>

          {/* Role Entries */}
          {profileData.roles.map((roleObj, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 items-center p-4 bg-gray-100 rounded-md">
              <span className="text-gray-700">{roleObj.roleName}</span>

              {/* Rate Display or Edit Field */}
              {editingIndex === index ? (
                <div className="flex justify-center">
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    onBlur={() => handleRateChange(index)}
                    className="block px-2 py-1 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              ) : (
                <span
                  onClick={() => handleEditRate(index)}
                  className="text-center text-gray-700 cursor-pointer hover:underline"
                >
                  {roleObj.rate}
                </span>
              )}

              {/* Toggle Active/Inactive */}
              <div className="flex justify-center">
                <div
                  onClick={() => handleRoleToggle(index)}
                  className={`relative w-12 h-6 bg-gray-300 rounded-full cursor-pointer ${
                    roleObj.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 ease-in-out ${
                      roleObj.isActive ? 'translate-x-6' : ''
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <RoleOptionsDropdown
                  onRemoveRole={() => handleRemoveRole(index)}
                />
              </div>
            </div>
          ))}
        </div>

        <button


          onClick={handleSave}
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md shadow-md hover:bg-blue-600"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;