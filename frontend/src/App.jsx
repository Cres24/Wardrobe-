
import { useEffect, useState } from "react";
import {
  Shirt,
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  Heart,
  Settings,
  Search,
  Plus,
  CloudSun,
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User,
  CheckCircle,
  AlertCircle,
  Layers,
} from "lucide-react";

import api from "./services/api";

// Sample wardrobe data for initial UI development
const sampleClothes = [
  {
    id: 1,
    name: "White T-Shirt",
    category: "T-Shirts",
    color: "White",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
  },
  {
    id: 2,
    name: "Black Jeans",
    category: "Pants",
    color: "Black",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
  },
  {
    id: 3,
    name: "Blue Shirt",
    category: "Shirts",
    color: "Blue",
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400",
  },
  {
    id: 4,
    name: "White Sneakers",
    category: "Shoes",
    color: "White",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  },
];

const sampleOutfits = [
  {
    id: 1,
    name: "Casual Everyday",
    description: "Perfect for a relaxed day out.",
    occasion: "Casual",
    items: [sampleClothes[0], sampleClothes[1], sampleClothes[3]],
  },
  {
    id: 2,
    name: "Smart Casual",
    description: "A simple and stylish combination.",
    occasion: "Dinner",
    items: [sampleClothes[2], sampleClothes[1]],
  },
];

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "My Wardrobe", icon: ShoppingBag },
  { name: "Outfit Generator", icon: Sparkles },
  { name: "Saved Outfits", icon: Heart },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [backendStatus, setBackendStatus] = useState("Checking");

  useEffect(() => {
    api
      .get("/health")
      .then(() => setBackendStatus("Connected"))
      .catch(() => setBackendStatus("Disconnected"));
  }, []);

  const clothes = sampleClothes.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const navigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
    setSearch("");
  };

  const Sidebar = () => (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-violet-600 p-2 rounded-xl">
            <Shirt size={25} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            wardrobe<span className="text-violet-400">.</span>
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-slate-400"
        >
          <X />
        </button>
      </div>

      <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">
        Workspace
      </p>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.name;

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                active
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={19} />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="bg-slate-800 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={17} className="text-violet-400" />
            <span className="text-sm font-semibold">Smart Styling</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your personal wardrobe assistant is getting ready.
          </p>
        </div>

        <button
          onClick={() => navigate("Settings")}
          className="flex items-center gap-3 text-slate-400 hover:text-white px-4 py-3 w-full text-sm"
        >
          <Settings size={19} />
          Settings
        </button>

        <div className="border-t border-slate-800 mt-4 pt-5 flex items-center gap-3">
          <div className="bg-violet-600 rounded-full w-10 h-10 flex items-center justify-center font-semibold">
            U
          </div>
          <div>
            <p className="text-sm font-medium">My Account</p>
            <p className="text-xs text-slate-500">Wardrobe Member</p>
          </div>
        </div>
      </div>
    </aside>
  );

  const Header = () => (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-slate-300"
        >
          <Menu size={24} />
        </button>

        <div>
          <p className="text-slate-400 text-sm">Your personal space</p>
          <h1 className="text-2xl font-bold">{activePage}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-3 text-slate-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clothes..."
            className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-violet-500 w-full sm:w-56"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
          <User size={19} className="text-slate-300" />
        </div>
      </div>
    </header>
  );

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );

  const ClothingCard = ({ item }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group">
      <div className="h-48 bg-slate-800 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-sm">{item.name}</h3>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>{item.category}</span>
          <span>{item.color}</span>
        </div>
      </div>
    </div>
  );

  const OutfitCard = ({ outfit }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">{outfit.name}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {outfit.description}
          </p>
        </div>
        <span className="text-xs bg-violet-500/10 text-violet-300 px-3 py-1 rounded-full">
          {outfit.occasion}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {outfit.items.map((item) => (
          <div key={item.id} className="h-28 rounded-xl overflow-hidden bg-slate-800">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <button className="mt-4 text-sm text-violet-400 flex items-center gap-2 hover:text-violet-300">
        View outfit <ChevronRight size={16} />
      </button>
    </div>
  );

  const Dashboard = () => (
    <>
      <div className="bg-gradient-to-r from-violet-700 to-indigo-700 rounded-3xl p-7 md:p-10 mb-8">
        <div className="max-w-xl">
          <p className="text-violet-200 text-sm mb-3">
            YOUR STYLE, ORGANIZED
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            A better way to get dressed.
          </h2>
          <p className="text-violet-100 text-sm leading-relaxed mb-6">
            Keep your wardrobe organized, discover new combinations
            and make the most of the clothes you already own.
          </p>

          <button
            onClick={() => navigate("My Wardrobe")}
            className="bg-white text-violet-800 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-violet-100 transition"
          >
            Explore my wardrobe
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Clothes"
          value="04"
          icon={Shirt}
          color="bg-violet-500/10 text-violet-400"
        />
        <StatCard
          title="Categories"
          value="04"
          icon={Layers}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          title="Saved Outfits"
          value="02"
          icon={Heart}
          color="bg-pink-500/10 text-pink-400"
        />
        <StatCard
          title="Style Score"
          value="85%"
          icon={TrendingUp}
          color="bg-green-500/10 text-green-400"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-lg">Recently Added</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your latest wardrobe additions
              </p>
            </div>

            <button
              onClick={() => navigate("My Wardrobe")}
              className="text-violet-400 text-sm"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {sampleClothes.map((item) => (
              <ClothingCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <CloudSun className="text-violet-400" size={24} />
            <h2 className="font-semibold">Style Tips</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">
                Start with neutral colors
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                White, black, beige and grey are versatile colors
                that work well with many outfits.
              </p>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <p className="text-sm font-medium mb-2">
                Make use of what you own
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Try creating different combinations from your
                existing wardrobe before buying new clothes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-semibold">Outfit Inspiration</h2>
            <p className="text-sm text-slate-400 mt-1">
              Combinations from your wardrobe
            </p>
          </div>

          <button
            onClick={() => navigate("Outfit Generator")}
            className="text-violet-400 text-sm flex items-center gap-1"
          >
            Generate more <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sampleOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      </section>
    </>
  );

  const Wardrobe = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Your Clothing Collection</h2>
          <p className="text-sm text-slate-400">
            Manage everything in your digital wardrobe.
          </p>
        </div>

        <button
          onClick={() => navigate("Upload Clothes")}
          className="bg-violet-600 hover:bg-violet-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
        >
          <Plus size={18} /> Add Clothes
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {clothes.map((item) => (
          <ClothingCard key={item.id} item={item} />
        ))}
      </div>

      {clothes.length === 0 && (
        <p className="text-slate-400 text-center py-12">
          No matching clothes found.
        </p>
      )}
    </>
  );

  const OutfitGenerator = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-700 to-violet-700 p-8 rounded-2xl">
        <Sparkles size={30} className="mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          Your personal outfit generator
        </h2>
        <p className="text-sm text-violet-100">
          Discover combinations using clothes already in your wardrobe.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {["Casual", "Formal", "Party", "Everyday"].map((occasion) => (
          <button
            key={occasion}
            className="bg-slate-800 border border-slate-700 hover:border-violet-500 rounded-xl px-5 py-3 text-sm"
          >
            {occasion}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sampleOutfits.map((outfit) => (
          <OutfitCard key={outfit.id} outfit={outfit} />
        ))}
      </div>

      <button className="bg-violet-600 hover:bg-violet-500 rounded-xl px-6 py-3 text-sm font-semibold">
        <Sparkles size={17} className="inline mr-2" />
        Generate New Outfits
      </button>
    </div>
  );

  const SavedOutfits = () => (
    <div>
      <h2 className="text-lg font-semibold mb-2">Your Favorite Looks</h2>
      <p className="text-sm text-slate-400 mb-6">
        Your saved outfit combinations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sampleOutfits.map((outfit) => (
          <OutfitCard key={outfit.id} outfit={outfit} />
        ))}
      </div>
    </div>
  );

  const UploadClothes = () => (
    <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8">
      <h2 className="text-xl font-semibold mb-2">Upload Clothing</h2>
      <p className="text-sm text-slate-400 mb-6">
        This upload interface will be connected to Cloudinary and
        the clothing database in our next development stage.
      </p>

      <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center">
        <Plus size={35} className="mx-auto text-violet-400 mb-4" />
        <p className="font-medium">Your upload feature is coming next</p>
        <p className="text-xs text-slate-500 mt-2">
          JPG, JPEG and PNG images will be supported.
        </p>
      </div>
    </div>
  );

  const SettingsPage = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="font-semibold text-lg mb-4">Application Settings</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm">Backend connection</p>
          <p className="text-xs text-slate-400 mt-1">
            Express API availability
          </p>
        </div>
        <span className="text-sm text-green-400">{backendStatus}</span>
      </div>
    </div>
  );

  const pageComponents = {
    Dashboard: <Dashboard />,
    "My Wardrobe": <Wardrobe />,
    "Outfit Generator": <OutfitGenerator />,
    "Saved Outfits": <SavedOutfits />,
    "Upload Clothes": <UploadClothes />,
    Settings: <SettingsPage />,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      <Sidebar />

      <main className="flex-1 min-w-0 p-5 md:p-8 lg:p-10">
        <Header />

        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <span>Wardrobe</span>
          <ChevronRight size={13} />
          <span className="text-violet-400">{activePage}</span>
        </div>

        {pageComponents[activePage] || <Dashboard />}

        <footer className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          Smart Wardrobe © 2026. Organize your style.
        </footer>
      </main>
    </div>
  );
}

export default App;
