import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { LanguageSelector } from "./LanguageSelector";
import { createServerClient } from "@/lib/supabase/server";
import { NavbarAuth } from "./NavbarAuth";

export const Navbar = async () => {
  const t = await getTranslations("Navigation");
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is admin
  let isAdmin = false;
  if (user) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    isAdmin = userRole?.role === 'admin';
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name;

  return (
    <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-nordic-dark flex items-center justify-center">
                <span className="material-icons text-white text-lg">apartment</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-nordic-dark">LuxeEstate</span>
            </Link>
          </div>

          {/* Center: Navigation items */}
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1" href="#">{t("buy")}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{t("rent")}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{t("sell")}</Link>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center space-x-6">
            <LanguageSelector />
            <button className="text-nordic-dark hover:text-mosque transition-colors">
              <span className="material-icons">search</span>
            </button>
            <button className="text-nordic-dark hover:text-mosque transition-colors relative">
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>
            <NavbarAuth 
              initialUser={user}
              avatarUrl={avatarUrl}
              fullName={fullName}
              loginText={t("login") || "Login"}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
      <div className="md:hidden border-t border-nordic-dark/5 bg-background-light overflow-hidden h-0 transition-all duration-300">
        <div className="px-4 py-2 space-y-1">
          <Link className="block px-3 py-2 rounded-md text-base font-medium text-mosque bg-mosque/10" href="#">{t("buy")}</Link>
          <Link className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5" href="#">{t("rent")}</Link>
          <Link className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5" href="#">{t("sell")}</Link>
        </div>
      </div>
    </nav>
  );
};
