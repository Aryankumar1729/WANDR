import re

with open("frontend/src/components/Navigation.tsx", "r") as f:
    content = f.read()

# Add useAuth import
content = content.replace(
    'import { useTripData } from "@/context/TripContext";',
    'import { useTripData } from "@/context/TripContext";\nimport { useAuth } from "@/context/AuthContext";'
)

# Add user state
content = content.replace(
    '  const [isDarkMode, setIsDarkMode] = useState(false);',
    '  const [isDarkMode, setIsDarkMode] = useState(false);\n  const { user, logout, isAuthenticated } = useAuth();\n  const [profileOpen, setProfileOpen] = useState(false);'
)

# Profile Component snippet
profile_jsx = """
            <div className="relative">
              {!isAuthenticated ? (
                <button onClick={() => window.location.assign("/login")} className="px-4 py-1.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors">
                  Login
                </button>
              ) : (
                <div 
                  className="flex items-center gap-2 ml-2 cursor-pointer group"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-black hidden sm:block">
                    {user?.name || "User"}
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    expand_more
                  </span>
                </div>
              )}

              {/* Dropdown */}
              {profileOpen && isAuthenticated && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      My Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Settings
                    </button>
                  </div>
                  <div className="py-1 border-t border-gray-100">
                    <button 
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
"""

# Replace in isTripView
old_profile_1 = """            <div 
              className="flex items-center gap-2 ml-2 cursor-pointer group"
              onClick={() => window.location.assign("/login")}
            >
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                D
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-black hidden sm:block">
                Demo User
              </span>
              <span className="material-symbols-outlined text-[18px]">
                expand_more
              </span>
            </div>"""

old_profile_2 = """        <div className="flex items-center gap-2 ml-2 cursor-pointer group" onClick={() => window.location.assign("/login") }>
          <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
            D
          </div>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-black">
            Demo User
          </span>
          <span className="material-symbols-outlined text-[18px]">
            expand_more
          </span>
        </div>"""

content = content.replace(old_profile_1, profile_jsx)
content = content.replace(old_profile_2, profile_jsx)

with open("frontend/src/components/Navigation.tsx", "w") as f:
    f.write(content)
