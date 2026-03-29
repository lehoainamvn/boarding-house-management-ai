import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"

import {
  LayoutDashboard,
  Home,
  DoorOpen,
  Users,
  Receipt,
  Zap,
  BarChart3,
  MessageSquare,
  Brain,
  Bell,
  Search,
  Menu,
  LogOut,
  User,
  Key,
  ChevronDown
} from "lucide-react"

import AIChatBox from "../components/AIChatBox"

export default function DashboardLayout(){

  const navigate = useNavigate()

  const userMenuRef = useRef(null)
  const notifyRef = useRef(null)

  const [sidebarOpen,setSidebarOpen] = useState(true)
  const [openUserMenu,setOpenUserMenu] = useState(false)
  const [openNotify,setOpenNotify] = useState(false)

  const [user,setUser] = useState({
    name:"Chủ trọ",
    email:"owner@thunam.local"
  })

  const notifications=[
    { id:1, text:"Phòng A101 yêu cầu sửa chữa", time: "5 phút trước" },
    { id:2, text:"Hóa đơn tháng này chưa thanh toán", time: "1 giờ trước" },
    { id:3, text:"Khách B203 gửi tin nhắn", time: "2 giờ trước" }
  ]

  useEffect(()=>{
    const savedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("profile"))

    if(savedUser){
      setUser({
        name:savedUser.name || "Chủ trọ",
        email:savedUser.email || ""
      })
    }
  },[])

  useEffect(()=>{
    function handleClickOutside(e){
      if(userMenuRef.current && !userMenuRef.current.contains(e.target)){
        setOpenUserMenu(false)
      }
      if(notifyRef.current && !notifyRef.current.contains(e.target)){
        setOpenNotify(false)
      }
    }

    document.addEventListener("mousedown",handleClickOutside)
    return ()=>{
      document.removeEventListener("mousedown",handleClickOutside)
    }
  },[])

  const handleLogout=()=>{
    localStorage.clear()
    navigate("/")
  }

  const menu=[
    {label:"Dashboard",path:"/home",icon:Home},
    {label:"Phòng trọ",path:"/rooms",icon:DoorOpen},
    {label:"Khách thuê",path:"/tenants",icon:Users},
    {label:"Hóa đơn",path:"/invoices",icon:Receipt},
    {label:"Điện nước",path:"/meters",icon:Zap},
    {label:"Thống kê",path:"/revenue",icon:BarChart3},
    {label:"Tin nhắn",path:"/messages",icon:MessageSquare},
    {label:"AI Prediction",path:"/prediction",icon:Brain}
  ]

  return(
    <div className="flex h-screen bg-slate-50/50 font-sans">

      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-slate-100 transition-all duration-300 flex flex-col shadow-sm`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 font-bold text-slate-800">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
               <LayoutDashboard size={18} />
            </div>
            {sidebarOpen && <span className="tracking-tight text-base">BSM Manager</span>}
          </div>

          <button
            onClick={()=>setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Menu size={18}/>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menu.map((item)=>{
            const Icon=item.icon
            return(
              <NavLink
                key={item.path}
                to={item.path}
                className={({isActive})=>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} className="transition-colors group-hover:text-indigo-600 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? "justify-start px-3.5" : "justify-center"} gap-3 text-rose-600 hover:bg-rose-50 py-2.5 rounded-xl text-sm font-semibold transition-colors`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-sm shadow-slate-100/50 relative z-10">
          
          {/* SEARCH */}
          <div className="relative hidden sm:block">
           
           
          </div>
          <div className="sm:hidden font-bold text-slate-800">BSM</div>

          <div className="flex items-center gap-3">

            {/* NOTIFICATION */}
            <div className="relative" ref={notifyRef}>
              <button
                onClick={()=>setOpenNotify(!openNotify)}
                className={`w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center relative transition-all ${openNotify ? "bg-slate-50 border-slate-200" : "bg-white hover:bg-slate-50"}`}
              >
                <Bell size={18} className="text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {openNotify && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm">Thông báo gần đây</span>
                    <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">Đánh dấu đã đọc</span>
                  </div>

                  <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                    {notifications.map(n=>(
                      <div
                        key={n.id}
                        className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <p className="text-sm text-slate-700 leading-snug">{n.text}</p>
                        <span className="text-xs text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="px-4 py-2.5 bg-slate-50 text-center border-t border-slate-100">
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Xem tất cả thông báo</button>
                  </div>
                </div>
              )}
            </div>

            {/* USER PROFILE */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={()=>setOpenUserMenu(!openUserMenu)}
                className={`flex items-center gap-3 p-1.5 rounded-xl border border-slate-100 transition-all ${openUserMenu ? "bg-slate-50 border-slate-200" : "bg-white hover:bg-slate-50"}`}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="text-left text-sm hidden md:block">
                  <p className="font-bold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-slate-400 text-xs truncate max-w-[120px]">{user.email}</p>
                </div>

                <ChevronDown size={14} className={`text-slate-400 hidden md:block transition-transform duration-200 ${openUserMenu ? "rotate-180" : ""}`} />
              </button>

              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 md:hidden">
                    <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                    <p className="text-slate-400 text-xs truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => { navigate("/profile"); setOpenUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 font-medium transition-colors"
                  >
                    <User size={16} className="text-slate-400" />
                    Chỉnh sửa thông tin
                  </button>

                  <button
                    onClick={() => { navigate("/change-password"); setOpenUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 font-medium transition-colors"
                  >
                    <Key size={16} className="text-slate-400" />
                    Đổi mật khẩu
                  </button>

                  <div className="border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-rose-50 text-rose-600 text-sm font-bold transition-colors"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet/>
          </div>
        </main>
      </div>

      <AIChatBox/>
    </div>
  )
}