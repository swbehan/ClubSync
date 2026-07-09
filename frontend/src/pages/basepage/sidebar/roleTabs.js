const MEMBER_TAB = {
    role: "member",
    to: "/member/member-dashboard",
    label: "Member",
    imageSrc: "https://cdn-icons-png.flaticon.com/128/16702/16702685.png",
    alt: "Member View Board Selection",
  };
  
  const TREASURER_TAB = {
    role: "treasurer",
    to: "/treasurer/treasurer-dashboard",
    label: "Treasurer",
    imageSrc: "https://cdn-icons-png.flaticon.com/128/3360/3360459.png",
    alt: "Treasurer View Board Selection",
    children: [MEMBER_TAB],
  };
  
  const ADMIN_TAB = {
    role: "admin",
    to: "/admin/admin-dashboard",
    label: "Admin",
    imageSrc: "https://cdn-icons-png.flaticon.com/128/6995/6995809.png",
    alt: "Admin View Board Selection",
    children: [TREASURER_TAB,],
  };
  
  export const ROLE_ACCESS = {
    guest: [
      {
        to: "/login",
        label: "Login",
        imageSrc: "https://cdn-icons-png.flaticon.com/128/1828/1828395.png",
        alt: "Login Icon",
      },
      {
        to: "/register",
        label: "Register",
        imageSrc: "https://cdn-icons-png.flaticon.com/128/2910/2910768.png",
        alt: "Register Account Icon",
      },
    ],
  
    member: [MEMBER_TAB],
  
    treasurer: [TREASURER_TAB],
  
    admin: [ADMIN_TAB],
  };