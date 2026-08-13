import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { createServerClient } from "@/lib/supabase/server";
import { NavbarAuth } from "./NavbarAuth";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";

export const Navbar = async () => {
  const t = await getTranslations("Navigation");
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let canAccessAdmin = false;
  if (user) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    const roles: string[] = userRole?.role ?? [];
    isAdmin = roles.includes('admin');
    canAccessAdmin = roles.includes('admin') || roles.includes('agent');
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name;

  return (
    <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5 dark:bg-background-dark/70 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Left: Logo + Mobile hamburger */}
          <div className="flex items-center gap-2">
            <MobileMenu
              buyLabel={t("buy")}
              rentLabel={t("rent")}
              sellLabel={t("sell")}
              isLoggedIn={!!user}
              loginLabel={t("login") || "Login"}
            />
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-nordic-dark dark:bg-white flex items-center justify-center">
                <span className="material-icons text-white text-lg dark:text-nordic-dark">apartment</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-nordic-dark dark:text-white">LuxeEstate</span>
            </Link>
          </div>

          {/* Center: Navigation items */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* Right: Controls */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:flex items-center gap-3">
              <LanguageSelector />
            </div>
            <div className="hidden md:block">
              <NavbarAuth
                initialUser={user}
                avatarUrl={avatarUrl}
                fullName={fullName}
                loginText={t("login") || "Login"}
                isAdmin={isAdmin}
                canAccessAdmin={canAccessAdmin}
              />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
