import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../firebaseConfig';
import { useAuth } from '../../authContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import NavBar from '../../Components/NavBar';
import Loading from '../../Components/Loading';
import RoleOptionsDropdown from '../../Components/ProfileRoleOptions';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePic: '',
    roles: [],
  });
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newRate, setNewRate] = useState('');

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
        } else {
          console.error('No such document!');
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

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData((prevData) => ({
        ...prevData,
        profilePic: URL.createObjectURL(file),
      }));
    }
  };

  const handleRemoveRole = (index) => {
    const updatedRoles = profileData.roles.filter((_, i) => i !== index);
    setProfileData({ ...profileData, roles: updatedRoles });
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      const docRef = doc(db, 'clients', currentUser.uid);
      await updateDoc(docRef, profileData);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <Loading />;
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
                <div className="flex items-center">
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                  <button
                    onClick={() => handleRateChange(index)}
                    className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-md"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <span className="text-gray-700 text-center">{roleObj.rate}</span>
              )}

              <div className="flex justify-center items-center">
                {/* Active Switch */}
                <div
                  className={`relative cursor-pointer w-12 h-6 rounded-full transition duration-300 ease-in-out ${
                    roleObj.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  onClick={() => handleRoleToggle(index)}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ease-in-out ${
                      roleObj.isActive ? 'translate-x-6' : ''
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <RoleOptionsDropdown
                  onEditPrice={() => handleEditRate(index)} // Call the edit handler
                  onRemoveRole={() => handleRemoveRole(index)}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;