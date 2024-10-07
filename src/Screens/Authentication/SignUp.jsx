import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { useAuth } from "../../authContext";
import TermsAndConditions from "../../components/Policy";
import { Navigate, Link, useNavigate } from "react-router-dom";
import Select from "react-select";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roles, setRoles] = useState([]); // State to store selected roles with rate and isActive
  const [roleOptions, setRoleOptions] = useState([]); // State to store roles fetched from Firestore
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch roles from Firestore
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesSnapshot = await db.collection("professions").get(); // Fetch all professions
        const options = rolesSnapshot.docs.map((doc) => ({
          value: doc.id, // Role ID
          label: doc.data().name, // Assuming 'name' field contains the profession name
        }));
        setRoleOptions(options);
      } catch (error) {
        console.error("Error fetching roles: ", error);
      }
    };

    fetchRoles(); // Call the function when component mounts
  }, []); // Empty dependency array ensures it runs only once

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword && termsAccepted) {
      setError("Passwords do not match");
      return;
    }
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      await db
        .collection("clients")
        .doc(user.uid)
        .set({
          email: user.email,
          firstName,
          lastName,
          roles,
          password,
          profilePic: 'https://firebasestorage.googleapis.com/v0/b/skilllinkwebapp.appspot.com/o/defaultProfilePic%2F1%20avatar1.jpeg?alt=media&token=6d55a5e1-3bed-4fff-be5a-ff2764caf084',
          avgRating:0,
          firstLogin: new Date().toLocaleDateString()
        });

      localStorage.setItem("isAuthenticated", "true");
      navigate("/");
      console.log("User signed up successfully");
    } catch (error) {
      setError(error.message);
    }
  };

  // Handling the selection of roles
  const handleRoleChange = (selectedOptions) => {
    // Map selected options to roles with default rate and isActive = false
    const updatedRoles = selectedOptions.map((option) => ({
      role: option.value, // roleId
      rate: 0.0, // Default rate
      isActive: false, // Default isActive state
    }));
    setRoles(updatedRoles);
  };

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Client Sign Up
        </h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="text-sm text-gray-500">
              Password must be at least 8 characters, include uppercase letters,
              numbers, and special characters.
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Multi-select for roles */}
          <div className="mb-4">
            <label
              htmlFor="roles"
              className="block text-sm font-medium text-gray-700"
            >
              Select Roles
            </label>
            <Select
              isMulti
              name="roles"
              options={roleOptions} // Options fetched from Firestore
              className="mt-1 block w-full"
              classNamePrefix="select"
              value={roles.map((role) => ({
                value: role.role,
                label: roleOptions.find((option) => option.value === role.role)?.label,
              }))} // Set value to match the current selected roles
              onChange={handleRoleChange} // Handle changes in role selection
              placeholder="Select roles"
              required
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                className="mr-2"
              />
              I accept the{" "}
              <span
                className="text-blue-500 cursor-pointer ml-1"
                onClick={() => setIsModalOpen(true)}
              >
                terms and conditions
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/signin" className="text-blue-500 hover:underline">
            Sign in here
          </Link>
          .
        </p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Close"
            >
              &times;
            </button>
            <TermsAndConditions />
          </div>
        </div>
      )}
    </div>
  );
}

export default SignUp;