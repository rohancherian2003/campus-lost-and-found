import { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "sonner";
import {
  Search, FolderOpen, BookOpen, Phone, Bell, ChevronRight,
  CheckSquare, Settings, LogOut, Plus, Edit2, Trash2,
  CheckCircle, Calendar, MapPin, Filter, Tag,
  AlertCircle, AlertTriangle,
  Upload, ArrowLeft, Info, Building2, ArrowUp, ShieldCheck, Lock,
  Recycle, Package, Heart
} from "lucide-react";
import LandingPage from "./components/LandingPage";
import { CardNameTooltip } from "./components/CardNameTooltip";
import LoginPage from "./components/LoginPage";
import campusLogo from "../imports/afa90946107debb396ffdb7284683a17-1.jpg";

// ─── Scroll To Top ─────────────────────────────────────────────────────────

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center justify-center"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────

const lostItems = [
  { id: 1, itemId: "LOST-001", name: "Black Leather Bi-fold Wallet with ID", date: "25 May 2026", location: "Library 2nd Floor", collectFrom: "Admin Reception", description: "Black leather bi-fold wallet, contains student ID card.", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop", category: "Accessories" },
  { id: 2, itemId: "LOST-002", name: "Blue Backpack", date: "10 May 2026", location: "Main Cafeteria", collectFrom: "Main Reception", description: "Medium-size blue Nike backpack with a red keychain attached.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop", category: "Bags & Backpacks" },
  { id: 3, itemId: "LOST-003", name: "Black Water Bottle", date: "15 Apr 2026", location: "Sports Complex Gym", collectFrom: "Humanities Reception", description: "500 ml black stainless steel bottle, name 'James' written on the bottom.", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop", category: "Water Bottles" },
  { id: 4, itemId: "LOST-004", name: "Sunglasses", date: "22 Apr 2026", location: "Central Quad", collectFrom: "Admin Reception", description: "Aviator-style sunglasses in a brown hard case.", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=300&fit=crop", category: "Eyewear" },
  { id: 5, itemId: "LOST-005", name: "Keys", date: "20 Mar 2026", location: "North Parking Lot", collectFrom: "Main Reception", description: "Bundle of 3 keys on a green bottle-opener keychain.", image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&h=300&fit=crop", category: "Keys & Keychains" },
];

const foundItems = [
  { id: 1, itemId: "FOUND-001", name: "Red Foldable Umbrella with Floral Print", date: "28 May 2026", location: "Campus Bus Stop", collectFrom: "Main Reception", description: "Compact red foldable umbrella with floral print lining.", category: "Accessories", image: "https://images.unsplash.com/photo-1767379200536-128ddff6c89c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80" },
  { id: 2, itemId: "FOUND-002", name: "Laptop Charger", date: "12 May 2026", location: "Computer Lab 3", collectFrom: "Admin Reception", description: "Dell 65 W laptop charger with a black cable, slightly frayed near the tip.", category: "Electronics", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80" },
  { id: 3, itemId: "FOUND-003", name: "Student ID Card", date: "15 Apr 2026", location: "Student Canteen", collectFrom: "Humanities Reception", description: "Campus ID card, name visible: Adeola Benson, Dept of Engineering.", category: "Others", image: "https://images.unsplash.com/photo-1623795457671-600b1223c2db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80" },
  { id: 4, itemId: "FOUND-004", name: "Earphones", date: "22 Apr 2026", location: "Library Reading Room", collectFrom: "Main Reception", description: "White wired earphones in a small zip pouch.", category: "Electronics", image: "https://images.unsplash.com/photo-1728583938904-7124b3e1e428?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80" },
  { id: 5, itemId: "FOUND-005", name: "Notebook", date: "25 Mar 2026", location: "Lecture Hall B", collectFrom: "Admin Reception", description: "A5 spiral notebook, Chemistry notes visible on first page.", category: "Books & Notebooks", image: "https://images.unsplash.com/photo-1612367980327-7454a7276aa7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80" },
];

const categories = [
  { name: "Bags & Backpacks", icon: "🎒", count: 24 },
  { name: "Water Bottles", icon: "🍶", count: 18 },
  { name: "Electronics", icon: "💻", count: 31 },
  { name: "Books & Notebooks", icon: "📚", count: 15 },
  { name: "Keys & Keychains", icon: "🔑", count: 22 },
  { name: "Accessories", icon: "⌚", count: 19 },
  { name: "Eyewear", icon: "🕶️", count: 11 },
  { name: "Others", icon: "📦", count: 8 },
];


const adminLostItems = [
  { id: 1,  name: "Black Wallet",          dateFound: "25 May 2026", location: "Library 2nd Floor",      status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Mirabel Smith",   reporterRoll: "STU-2024-001", reporterPhone: "+91 9876543210", reporterEmail: "mirabel@campus.edu",  reportedAt: "25 May 2026, 09:45 AM", lastUpdated: "25 May 2026, 09:45 AM" },
  { id: 3,  name: "Black Note Book",        dateFound: "24 May 2026", location: "Square Hall",            status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Priya Nair",      reporterRoll: "STU-2024-003", reporterPhone: "+91 9876543212", reporterEmail: "priya@campus.edu",    reportedAt: "24 May 2026, 10:20 AM", lastUpdated: "24 May 2026, 10:20 AM" },
  { id: 5,  name: "Black Water Bottle",     dateFound: "10 May 2026", location: "Sports Complex Gym",     status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Rajesh Kumar",    reporterRoll: "STU-2024-005", reporterPhone: "+91 9876543214", reporterEmail: "rajesh@campus.edu",   reportedAt: "10 May 2026, 11:05 AM", lastUpdated: "10 May 2026, 11:05 AM" },
  { id: 6,  name: "Keys",                   dateFound: "10 May 2026", location: "North Parking Lot",      status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Ananya Singh",    reporterRoll: "STU-2024-006", reporterPhone: "+91 9876543215", reporterEmail: "ananya@campus.edu",   reportedAt: "10 May 2026, 02:30 PM", lastUpdated: "10 May 2026, 02:30 PM" },
  { id: 9,  name: "iPhone 13 (Grey)",       dateFound: "25 Apr 2026", location: "Cafeteria B",            status: "Returned",     studentName: "James Okafor", rollNo: "STU-2024-019", claimedDate: "30 Apr 2026", reporterName: "James Okafor",    reporterRoll: "STU-2024-019", reporterPhone: "+91 9876543220", reporterEmail: "james@campus.edu",    reportedAt: "25 Apr 2026, 08:15 AM", lastUpdated: "30 Apr 2026, 03:00 PM" },
  { id: 10, name: "Blue Denim Jacket",      dateFound: "22 Apr 2026", location: "Auditorium Foyer",       status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Fatima Al-Rashid",reporterRoll: "STU-2024-031", reporterPhone: "+91 9876543222", reporterEmail: "fatima@campus.edu",   reportedAt: "22 Apr 2026, 01:45 PM", lastUpdated: "22 Apr 2026, 01:45 PM" },
  { id: 11, name: "Prescription Glasses",   dateFound: "20 Apr 2026", location: "Lecture Hall A",         status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Chloe Martin",    reporterRoll: "STU-2024-093", reporterPhone: "+91 9876543230", reporterEmail: "chloe@campus.edu",    reportedAt: "20 Apr 2026, 09:00 AM", lastUpdated: "20 Apr 2026, 09:00 AM" },
  { id: 12, name: "Samsung Galaxy Buds",    dateFound: "18 Apr 2026", location: "Engineering Block",      status: "Returned",     studentName: "Liam Patel",   rollNo: "STU-2024-057", claimedDate: "25 Apr 2026", reporterName: "Liam Patel",      reporterRoll: "STU-2024-057", reporterPhone: "+91 9876543232", reporterEmail: "liam@campus.edu",     reportedAt: "18 Apr 2026, 11:30 AM", lastUpdated: "25 Apr 2026, 10:15 AM" },
  { id: 13, name: "Sports Bag",             dateFound: "15 Apr 2026", location: "Indoor Stadium",         status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Yusuf Hassan",    reporterRoll: "STU-2024-088", reporterPhone: "+91 9876543240", reporterEmail: "yusuf@campus.edu",    reportedAt: "15 Apr 2026, 07:45 AM", lastUpdated: "15 Apr 2026, 07:45 AM" },
  { id: 14, name: "USB Flash Drive (32GB)", dateFound: "15 Apr 2026", location: "Computer Lab 2",         status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Ethan Zhao",      reporterRoll: "STU-2024-102", reporterPhone: "+91 9876543245", reporterEmail: "ethan@campus.edu",    reportedAt: "15 Apr 2026, 02:00 PM", lastUpdated: "15 Apr 2026, 02:00 PM" },
  { id: 15, name: "Chemistry Textbook",     dateFound: "12 Apr 2026", location: "Science Block Room 5",   status: "Returned",     studentName: "Amara Diallo", rollNo: "STU-2024-064", claimedDate: "20 Apr 2026", reporterName: "Amara Diallo",    reporterRoll: "STU-2024-064", reporterPhone: "+91 9876543250", reporterEmail: "amara@campus.edu",    reportedAt: "12 Apr 2026, 10:00 AM", lastUpdated: "20 Apr 2026, 04:30 PM" },
  { id: 16, name: "Power Bank",             dateFound: "05 Apr 2026", location: "Student Union",          status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Noah Williams",   reporterRoll: "STU-2024-110", reporterPhone: "+91 9876543255", reporterEmail: "noah@campus.edu",     reportedAt: "05 Apr 2026, 09:20 AM", lastUpdated: "05 Apr 2026, 09:20 AM" },
  { id: 17, name: "Wrist Watch (Silver)",   dateFound: "05 Apr 2026", location: "Gym Changing Room",      status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Sofia Martinez",  reporterRoll: "STU-2024-118", reporterPhone: "+91 9876543260", reporterEmail: "sofia@campus.edu",    reportedAt: "05 Apr 2026, 06:55 PM", lastUpdated: "05 Apr 2026, 06:55 PM" },
  { id: 18, name: "Laptop Bag (Black)",     dateFound: "25 Mar 2026", location: "Admin Block Corridor",   status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Omar Farouq",     reporterRoll: "STU-2024-125", reporterPhone: "+91 9876543265", reporterEmail: "omar@campus.edu",     reportedAt: "25 Mar 2026, 11:40 AM", lastUpdated: "25 Mar 2026, 11:40 AM" },
  { id: 19, name: "Student ID Card",        dateFound: "20 Mar 2026", location: "Library Entrance",       status: "Returned",     studentName: "Adeola Benson",rollNo: "STU-2024-012", claimedDate: "22 Mar 2026", reporterName: "Adeola Benson",   reporterRoll: "STU-2024-012", reporterPhone: "+91 9876543270", reporterEmail: "adeola@campus.edu",   reportedAt: "20 Mar 2026, 03:15 PM", lastUpdated: "22 Mar 2026, 09:00 AM" },
  { id: 20, name: "Airpods Pro (White)",    dateFound: "20 Mar 2026", location: "Food Court",             status: "Not Returned", studentName: "",             rollNo: "",            claimedDate: "", reporterName: "Ines Dupont",     reporterRoll: "STU-2024-133", reporterPhone: "+91 9876543275", reporterEmail: "ines@campus.edu",     reportedAt: "20 Mar 2026, 12:30 PM", lastUpdated: "20 Mar 2026, 12:30 PM" },
];

const adminFoundItems = [
  { id: 2,  name: "Blue Rucksack",          dateFound: "28 May 2026", location: "Main Cafeteria",         status: "Returned",     studentName: "John Adams",   rollNo: "STU-2024-002", returnedDate: "2026-05-30", foundAt: "28 May 2026, 08:30 AM", lastUpdated: "30 May 2026, 02:45 PM" },
  { id: 4,  name: "Sunglasses",             dateFound: "25 May 2026", location: "Central Quad",           status: "Returned",     studentName: "Sarah Chen",   rollNo: "STU-2024-045", returnedDate: "2026-05-28", foundAt: "25 May 2026, 01:15 PM", lastUpdated: "28 May 2026, 11:00 AM" },
  { id: 7,  name: "Red Umbrella",           dateFound: "20 May 2026", location: "Campus Bus Stop",        status: "Not Returned", studentName: "",             rollNo: "",             returnedDate: "",           foundAt: "20 May 2026, 07:50 AM", lastUpdated: "20 May 2026, 07:50 AM" },
  { id: 8,  name: "Laptop Charger",         dateFound: "15 May 2026", location: "Computer Lab 3",         status: "Returned",     studentName: "Michael Brown",rollNo: "STU-2024-078", returnedDate: "2026-05-22", foundAt: "15 May 2026, 10:40 AM", lastUpdated: "22 May 2026, 09:30 AM" },
  { id: 21, name: "Student ID Card",        dateFound: "10 May 2026", location: "Student Canteen",        status: "Returned",     studentName: "Adeola Benson",rollNo: "STU-2024-012", returnedDate: "2026-05-12", foundAt: "10 May 2026, 12:00 PM", lastUpdated: "12 May 2026, 10:20 AM" },
  { id: 22, name: "Earphones (White)",      dateFound: "05 May 2026", location: "Library Reading Room",   status: "Not Returned", studentName: "",             rollNo: "",             returnedDate: "",           foundAt: "05 May 2026, 03:25 PM", lastUpdated: "05 May 2026, 03:25 PM" },
  { id: 23, name: "Chemistry Notebook",     dateFound: "25 Apr 2026", location: "Lecture Hall B",         status: "Returned",     studentName: "Liam Patel",   rollNo: "STU-2024-057", returnedDate: "2026-05-02", foundAt: "25 Apr 2026, 09:10 AM", lastUpdated: "02 May 2026, 03:00 PM" },
  { id: 24, name: "Wallet (Brown Leather)", dateFound: "22 Apr 2026", location: "Sports Pavilion",        status: "Not Returned", studentName: "",             rollNo: "",             returnedDate: "",           foundAt: "22 Apr 2026, 04:00 PM", lastUpdated: "22 Apr 2026, 04:00 PM" },
  { id: 25, name: "Water Bottle (Blue)",    dateFound: "15 Apr 2026", location: "Engineering Lab 2",      status: "Not Returned", studentName: "",             rollNo: "",             returnedDate: "",           foundAt: "15 Apr 2026, 11:50 AM", lastUpdated: "15 Apr 2026, 11:50 AM" },
  { id: 26, name: "Wired Keyboard",         dateFound: "10 Apr 2026", location: "Media Studies Room",     status: "Returned",     studentName: "Ethan Zhao",   rollNo: "STU-2024-102", returnedDate: "2026-04-20", foundAt: "10 Apr 2026, 02:35 PM", lastUpdated: "20 Apr 2026, 01:15 PM" },
  { id: 27, name: "Prescription Glasses",   dateFound: "05 Apr 2026", location: "Health Centre Waiting",  status: "Not Returned", studentName: "",             rollNo: "",             returnedDate: "",           foundAt: "05 Apr 2026, 10:05 AM", lastUpdated: "05 Apr 2026, 10:05 AM" },
  { id: 28, name: "Gym Gloves",             dateFound: "05 Apr 2026", location: "Fitness Centre",         status: "Returned",     studentName: "Sofia Martinez",rollNo: "STU-2024-118",returnedDate: "2026-04-12", foundAt: "05 Apr 2026, 05:30 PM", lastUpdated: "12 Apr 2026, 08:45 AM" },
  { id: 29, name: "Campus Bus Pass",        dateFound: "25 Mar 2026", location: "Main Gate",              status: "Returned",     studentName: "Omar Farouq",  rollNo: "STU-2024-125", returnedDate: "2026-03-25", foundAt: "25 Mar 2026, 08:00 AM", lastUpdated: "25 Mar 2026, 04:00 PM" },
  { id: 30, name: "Mini Tripod",            dateFound: "20 Mar 2026", location: "Photography Studio",     status: "Not Returned", studentName: "",             rollNo: "",             returnedDate: "",           foundAt: "20 Mar 2026, 01:20 PM", lastUpdated: "20 Mar 2026, 01:20 PM" },
  { id: 31, name: "Lab Safety Goggles",     dateFound: "15 Mar 2026", location: "Chemistry Lab",          status: "Not Returned", studentName: "",             rollNo: "",             returnedDate: "",           foundAt: "15 Mar 2026, 03:45 PM", lastUpdated: "15 Mar 2026, 03:45 PM" },
  { id: 32, name: "Hoodie (Navy Blue)",     dateFound: "10 Mar 2026", location: "Library 3rd Floor",      status: "Not Returned", studentName: "",             rollNo: "",             returnedDate: "",           foundAt: "10 Mar 2026, 02:10 PM", lastUpdated: "10 Mar 2026, 02:10 PM" },
];

const claimedItems = [
  { student: "Mirabel Smith",    id: "STU-2024-001", item: "Black Wallet",         type: "Lost",  returnedDate: "12 May 2024", status: "Returned" },
  { student: "John Adams",       id: "STU-2024-002", item: "Blue Backpack",        type: "Found", returnedDate: "13 May 2024", status: "Returned" },
  { student: "Priya Nair",       id: "STU-2024-003", item: "Black Note Book",      type: "Lost",  returnedDate: "11 May 2024", status: "Returned" },
  { student: "Sarah Chen",       id: "STU-2024-045", item: "Sunglasses",           type: "Found", returnedDate: "14 May 2024", status: "Returned" },
  { student: "Michael Brown",    id: "STU-2024-078", item: "Laptop Charger",       type: "Found", returnedDate: "15 May 2024", status: "Returned" },
  { student: "Adeola Benson",    id: "STU-2024-012", item: "Student ID Card",      type: "Found", returnedDate: "16 May 2024", status: "Returned" },
  { student: "Rajesh Kumar",     id: "STU-2024-005", item: "Black Water Bottle",   type: "Lost",  returnedDate: "17 May 2024", status: "Returned" },
  { student: "Ananya Singh",     id: "STU-2024-006", item: "Keys",                 type: "Lost",  returnedDate: "18 May 2024", status: "Returned" },
  { student: "James Okafor",     id: "STU-2024-019", item: "Earphones",            type: "Found", returnedDate: "19 May 2024", status: "Returned" },
  { student: "Fatima Al-Rashid", id: "STU-2024-031", item: "Red Umbrella",         type: "Found", returnedDate: "20 May 2024", status: "Returned" },
  { student: "Liam Patel",       id: "STU-2024-057", item: "Chemistry Notebook",   type: "Lost",  returnedDate: "21 May 2024", status: "Returned" },
  { student: "Amara Diallo",     id: "STU-2024-064", item: "Airpods Case",         type: "Found", returnedDate: "22 May 2024", status: "Returned" },
  { student: "Yusuf Hassan",     id: "STU-2024-088", item: "Sports Bag",           type: "Lost",  returnedDate: "23 May 2024", status: "Returned" },
  { student: "Chloe Martin",     id: "STU-2024-093", item: "Prescription Glasses", type: "Lost",  returnedDate: "24 May 2024", status: "Returned" },
  { student: "Ethan Zhao",       id: "STU-2024-102", item: "USB Flash Drive",      type: "Found", returnedDate: "25 May 2024", status: "Returned" },
];


const collectFromOptions = ["Admin Reception", "Main Reception", "Humanities Reception"];

export type ReturnedLostRecord = {
  id: number;
  name: string;
  reportedDate: string;
  closedDate: string;
  studentName: string;
  rollNo: string;
  location: string;
  reporter: string;
  reporterPhone: string;
  reporterEmail: string;
};

export type DisposedRecord = {
  id: number;
  name: string;
  type: "Lost" | "Found";
  reportedDate: string;
  location: string;
  reporter: string;
  reporterPhone: string;
  reporterEmail: string;
  disposalLocation: string;
  donatedTo: string;
  disposedDate: string;
  notes: string;
};


// ─── Upload Page (Admin) ───────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-gray-700 text-xs font-medium block mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}


function UploadPage({ onBack }: { onBack: () => void }) {
  const [itemType, setItemType] = useState<"lost" | "found">("found");
  const [contactType, setContactType] = useState<"student" | "staff">("student");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", location: "", date: "", collectFrom: "", description: "", image: "",
    studentName: "", rollNo: "", phone: "", email: "",
    staffName: "", employeeId: "", department: "", staffPhone: "", staffEmail: "",
  });

  const isLost = itemType === "lost";
  const isStudent = contactType === "student";
  const accent = isLost ? "#f59e0b" : "#10b981";
  const btnClass = isLost
    ? "bg-amber-500 hover:bg-amber-600 text-white"
    : "bg-emerald-500 hover:bg-emerald-600 text-white";

  const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all";

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleTypeSwitch = (t: "lost" | "found") => {
    setItemType(t);
    setForm({ name: "", location: "", date: "", collectFrom: "", description: "", image: "", studentName: "", rollNo: "", phone: "", email: "", staffName: "", employeeId: "", department: "", staffPhone: "", staffEmail: "" });
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  const contactName = isStudent ? form.studentName : form.staffName;
  const contactEmail = isStudent ? form.email : form.staffEmail;

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-10 max-w-md w-full text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isLost ? "bg-amber-100" : "bg-emerald-100"}`}>
            <CheckCircle size={32} style={{ color: accent }} />
          </div>
          <h2 className="text-gray-900 text-xl font-bold mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
            Item Reported Successfully!
          </h2>
          <p className="text-gray-600 text-sm mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
            <span className="font-semibold text-gray-900">{form.name || "The item"}</span> has been added to the system.
          </p>
          {contactName && (
            <p className="text-gray-600 text-sm mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {isLost ? "We'll contact" : "Contact on file:"} <span className="font-semibold text-gray-900">{contactEmail}</span>{isLost ? " if your item is found." : "."}
            </p>
          )}
          {form.collectFrom && (
            <p className="text-gray-600 text-sm mb-6" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {isLost ? "If found, you'll be notified to collect it from" : "Students can bring it to"} <span className="font-semibold text-gray-900">{form.collectFrom}</span>.
            </p>
          )}
          <button
            onClick={onBack}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${btnClass}`}
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Form header strip */}
          <div className="px-6 py-5 border-b border-gray-200">
            <p className="text-gray-900 font-semibold text-base mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>Report an Item</p>
            {/* Lost / Found toggle */}
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => handleTypeSwitch("lost")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLost ? "bg-amber-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                <AlertCircle size={14} />
                Lost Item
              </button>
              <button
                type="button"
                onClick={() => handleTypeSwitch("found")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !isLost ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                <CheckCircle size={14} />
                Found Item
              </button>
            </div>
            <p className="text-gray-400 text-[11px] mt-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Fill in the details below. All fields marked * are required.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Item Name */}
            <Field label="Item Name" required>
              <input
                required
                value={form.name}
                onChange={set("name")}
                placeholder={isLost ? "e.g. Black Leather Wallet" : "e.g. Blue Nike Backpack"}
                className={inputCls}
                style={{ fontFamily: "DM Sans, sans-serif" }}
              />
            </Field>

            {/* Location + Date row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={isLost ? "Last Seen Location" : "Location Found"} required>
                <input
                  required
                  value={form.location}
                  onChange={set("location")}
                  placeholder={isLost ? "e.g. Library 2nd Floor" : "e.g. Main Cafeteria"}
                  className={inputCls}
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                />
              </Field>
              <Field label={isLost ? "Date Lost" : "Date Found"} required>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={set("date")}
                  className={inputCls}
                  style={{ colorScheme: "light", fontFamily: "DM Sans, sans-serif" }}
                />
              </Field>
            </div>

            {/* Collect From — only for found items */}
            {!isLost && (
              <Field label="Where to Receive From" required>
                <select
                  required
                  value={form.collectFrom}
                  onChange={set("collectFrom")}
                  className={inputCls + " appearance-none"}
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  <option value="" disabled className="bg-white">Select reception/office</option>
                  {collectFromOptions.map((o) => <option key={o} value={o} className="bg-white">{o}</option>)}
                </select>
              </Field>
            )}

            {/* Description */}
            <Field label="Description" required>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={set("description")}
                placeholder="Describe the item clearly — colour, size, any distinguishing marks, contents if applicable..."
                className={inputCls + " resize-none"}
                style={{ fontFamily: "DM Sans, sans-serif" }}
              />
            </Field>

            {/* ── Contact Type Switcher ─────────────────────── */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-gray-900 font-semibold text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                    Contact Details
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    {isLost ? "To contact if item is found" : "Reporter contact information"}
                  </p>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 mt-3">
                <button
                  type="button"
                  onClick={() => setContactType("student")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isStudent ? "bg-cyan-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Student Contact Details
                </button>
                <button
                  type="button"
                  onClick={() => setContactType("staff")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    !isStudent ? "bg-cyan-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  Staff Contact Details
                </button>
              </div>
            </div>

            {/* Student Contact Fields */}
            <div
              style={{
                display: isStudent ? "block" : "none",
                transition: "opacity 0.2s ease",
                opacity: isStudent ? 1 : 0,
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Student Name" required={isStudent}>
                  <input
                    required={isStudent}
                    value={form.studentName}
                    onChange={set("studentName")}
                    placeholder="Enter full name"
                    className={inputCls}
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </Field>
                <Field label="Roll Number" required={isStudent}>
                  <input
                    required={isStudent}
                    value={form.rollNo}
                    onChange={set("rollNo")}
                    placeholder="e.g. STU-2024-001"
                    className={inputCls}
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Field label="Phone Number" required={isStudent}>
                  <input
                    required={isStudent}
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="Enter phone number"
                    className={inputCls}
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </Field>
                <Field label="Email Address" required={isStudent}>
                  <input
                    required={isStudent}
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="Enter email address"
                    className={inputCls}
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </Field>
              </div>
            </div>

            {/* Staff Contact Fields */}
            <div
              style={{
                display: !isStudent ? "block" : "none",
                transition: "opacity 0.2s ease",
                opacity: !isStudent ? 1 : 0,
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Staff Name" required={!isStudent}>
                  <input
                    required={!isStudent}
                    value={form.staffName}
                    onChange={set("staffName")}
                    placeholder="Enter full name"
                    className={inputCls}
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </Field>
                <Field label="Employee ID" required={!isStudent}>
                  <input
                    required={!isStudent}
                    value={form.employeeId}
                    onChange={set("employeeId")}
                    placeholder="e.g. EMP-2024-001"
                    className={inputCls}
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Department" required={!isStudent}>
                  <input
                    required={!isStudent}
                    value={form.department}
                    onChange={set("department")}
                    placeholder="e.g. Engineering, Admin, Library…"
                    className={inputCls}
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Field label="Phone Number" required={!isStudent}>
                  <input
                    required={!isStudent}
                    type="tel"
                    value={form.staffPhone}
                    onChange={set("staffPhone")}
                    placeholder="Enter phone number"
                    className={inputCls}
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </Field>
                <Field label="Email Address" required={!isStudent}>
                  <input
                    required={!isStudent}
                    type="email"
                    value={form.staffEmail}
                    onChange={set("staffEmail")}
                    placeholder="Enter email address"
                    className={inputCls}
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </Field>
              </div>
            </div>

            {/* Info notice */}
          </div>

          {/* Footer buttons */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-all"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${btnClass}`}
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              <Upload size={14} />
              Report {isLost ? "Lost" : "Found"} Item
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Public Browse View ────────────────────────────────────────────────────

function PublicBrowseView({ type, onBack }: { type: "lost" | "found"; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
          <div className="flex items-center gap-3">
            <img src={campusLogo} alt="Campus Logo" className="w-8 h-8 object-contain" />
            <p className="text-gray-900 font-semibold text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Campus Lost and Found</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <CombinedItemsPage initialFilter={type} />
      </div>
      <ScrollToTopButton />
    </div>
  );
}

// ─── Student View ──────────────────────────────────────────────────────────

function StudentSidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const navItems = [
    { id: "found-items", icon: <CheckCircle size={16} />, label: "Found Items" },
    { id: "categories",  icon: <Tag size={16} />,          label: "Categories"  },
    { id: "guidelines",  icon: <BookOpen size={16} />,     label: "Guidelines"  },
  ];

  return (
    <aside className="w-56 bg-[#1e2b5e] flex flex-col min-h-screen shrink-0">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/30 flex items-center justify-center">
            <ShieldCheck size={16} className="text-cyan-200" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Campus</p>
            <p className="text-cyan-300 text-[10px] leading-tight">Lost &amp; Found</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
              active === item.id
                ? "bg-cyan-500 text-white"
                : "text-cyan-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.icon}
            <span style={{ fontFamily: "DM Sans, sans-serif" }}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mx-3 mb-4 rounded-xl bg-cyan-500/20 border border-cyan-400/20">
        <p className="text-cyan-200 text-xs font-medium mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Lost something?</p>
        <p className="text-cyan-300 text-[10px] leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif" }}>
          Report it to the campus office. Admin will contact you if your item is found.
        </p>
        <button className="mt-2 w-full bg-cyan-500 hover:bg-cyan-400 text-white text-[11px] font-medium py-1.5 rounded-lg transition-colors">
          Report to Office
        </button>
      </div>
    </aside>
  );
}

function CategoriesStudentPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = foundItems.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>Browse by Category</h1>
        <p className="text-gray-500 text-sm mt-0.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Browse found items organised by category</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search found items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 text-xs text-gray-500" style={{ fontFamily: "DM Sans, sans-serif" }}>
          Showing {filteredItems.length} found item(s)
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>No items found matching your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <div
              key={`found-${item.id}`}
              className="bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-cyan-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardNameTooltip name={item.name} className="font-semibold text-gray-900 text-sm leading-tight" style={{ fontFamily: "Outfit, sans-serif" }} />
                    <p className="text-[10px] text-gray-500 mt-0.5" style={{ fontFamily: "DM Sans, sans-serif" }}>ID: {item.itemId}</p>
                  </div>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0 ml-2 bg-emerald-50 text-emerald-600 border-emerald-200">
                    FOUND
                  </span>
                </div>
                <p className="text-gray-500 text-[11px] leading-relaxed mb-3 line-clamp-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {item.description}
                </p>
                <div className="space-y-1 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Tag size={10} className="text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-500">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={10} className="text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-500">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={10} className="text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-500">{item.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 size={10} className="text-cyan-400 shrink-0" />
                    <span className="text-[10px] text-cyan-600 font-medium">{item.collectFrom}</span>
                  </div>
                </div>
                <ClaimCountdownBar dateStr={item.date} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const BROWSE_PAGE_SIZE = 6;

const allCombinedItems = [
  ...lostItems.map(item  => ({ ...item, type: "lost"  as const })),
  ...foundItems.map(item => ({ ...item, type: "found" as const })),
];

function CombinedItemsPage({ initialFilter = "all" }: { initialFilter?: "all" | "lost" | "found" }) {
  const [searchTerm, setSearchTerm]             = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [countdownFilter, setCountdownFilter]   = useState("");
  const [locationFilter, setLocationFilter]     = useState("");
  const [dateFrom, setDateFrom]                 = useState("");
  const [dateTo, setDateTo]                     = useState("");
  const [currentPage, setCurrentPage]           = useState(1);

  // Only found items shown on this page
  const foundOnly = foundItems;

  const filtered = foundOnly.filter(item => {
    const matchesSearch   = !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesCountdown = !countdownFilter || getDaysInfo(item.date).countdownStatus === countdownFilter;
    const matchesLocation = !locationFilter || item.location.toLowerCase().includes(locationFilter.toLowerCase());
    const itemDate = parseDateForCountdown(item.date);
    const matchesDateFrom = !dateFrom || itemDate >= new Date(dateFrom);
    const matchesDateTo   = !dateTo   || itemDate <= new Date(dateTo);
    return matchesSearch && matchesCategory && matchesCountdown && matchesLocation && matchesDateFrom && matchesDateTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / BROWSE_PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * BROWSE_PAGE_SIZE, safePage * BROWSE_PAGE_SIZE);

  const applySearch    = (v: string) => { setSearchTerm(v);       setCurrentPage(1); };
  const applyCategory  = (v: string) => { setSelectedCategory(v); setCurrentPage(1); };
  const applyCountdown = (v: string) => { setCountdownFilter(v);  setCurrentPage(1); };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Statistics derived from admin found items (complete dataset)
  const totalFound      = adminFoundItems.length;
  const returnedCount   = adminFoundItems.filter(i => i.status === "Returned").length;
  const notReturnedItems = adminFoundItems.filter(i => i.status === "Not Returned");
  const availableCount  = notReturnedItems.filter(i => !getDaysInfo(i.dateFound).isExpired).length;
  const expiringSoonCount = notReturnedItems.filter(i =>
    ["expiring", "last10"].includes(getDaysInfo(i.dateFound).countdownStatus)
  ).length;

  const statsCards = [
    { label: "Total Found Items",       value: totalFound,        dot: "bg-cyan-500",    card: "bg-cyan-50 border-cyan-200",    txt: "text-cyan-700" },
    { label: "Available for Collection",value: availableCount,    dot: "bg-emerald-500", card: "bg-emerald-50 border-emerald-200", txt: "text-emerald-700" },
    { label: "Expiring Soon",           value: expiringSoonCount, dot: "bg-amber-500",   card: "bg-amber-50 border-amber-200",  txt: "text-amber-700" },
    { label: "Returned Items",          value: returnedCount,     dot: "bg-violet-500",  card: "bg-violet-50 border-violet-200", txt: "text-violet-700" },
  ];

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div>
        <h1
          className="text-2xl text-gray-900"
          style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}
        >
          Campus Found Items
        </h1>
        <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
          Browse all found items available for collection across campus.
        </p>
      </div>


      {/* ── Search & Filter Bar ─────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item name or description…"
              value={searchTerm}
              onChange={e => applySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/15 transition-all"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            />
          </div>
          {/* Location */}
          <div className="relative">
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by location…"
              value={locationFilter}
              onChange={e => { setLocationFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/15 transition-all"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            />
          </div>
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={e => applyCategory(e.target.value)}
            className="px-4 py-2.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/15 transition-all appearance-none"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          {/* Claim status */}
          <select
            value={countdownFilter}
            onChange={e => applyCountdown(e.target.value)}
            className="px-4 py-2.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/15 transition-all appearance-none"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <option value="">All Claim Status</option>
            <option value="active">🟢 Active (31–60 days)</option>
            <option value="expiring">🟡 Expiring Soon (11–30 days)</option>
            <option value="last10">🔴 Last 10 Days</option>
          </select>
          {/* Date From */}
          <div className="relative">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/15 transition-all"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-400" style={{ fontFamily: "DM Sans, sans-serif" }}>
            <span className="font-semibold text-gray-600">{filtered.length}</span> item{filtered.length !== 1 ? "s" : ""} found
          </p>
          {(searchTerm || selectedCategory || countdownFilter || locationFilter || dateFrom || dateTo) && (
            <button
              onClick={() => { applySearch(""); applyCategory(""); applyCountdown(""); setLocationFilter(""); setDateFrom(""); setDateTo(""); setCurrentPage(1); }}
              className="text-xs text-[#0891B2] hover:underline font-medium"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* ── Cards Grid ──────────────────────────────────────── */}
      {pageItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E5E7EB] rounded-2xl">
          <FolderOpen size={40} className="text-gray-200 mb-3" />
          <p className="text-gray-500 text-sm font-medium" style={{ fontFamily: "DM Sans, sans-serif" }}>No items match your search</p>
          <p className="text-gray-400 text-xs mt-1" style={{ fontFamily: "DM Sans, sans-serif" }}>Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pageItems.map(item => (
            <div
              key={`found-${item.id}`}
              className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden cursor-pointer transition-all duration-250 hover:shadow-xl hover:-translate-y-1.5 hover:border-transparent"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              {/* Card body */}
              <div className={`p-4 ${getDaysInfo(item.date).isExpired ? "opacity-70" : ""}`}>
                <div className="mb-2">
                  <CardNameTooltip
                    name={item.name}
                    className="text-gray-900 text-sm leading-snug"
                    style={{ fontFamily: "Outfit, sans-serif", fontWeight: 700 }}
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono tracking-wide">{item.itemId}</p>
                </div>

                <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2 mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {item.description}
                </p>

                {/* Meta rows */}
                <div className="space-y-1.5 pt-3 border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <MapPin size={11} className="text-gray-400 shrink-0" />
                    <span className="text-[11px] text-gray-600 truncate" style={{ fontFamily: "DM Sans, sans-serif" }}>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={11} className="text-gray-400 shrink-0" />
                    <span className="text-[11px] text-gray-600" style={{ fontFamily: "DM Sans, sans-serif" }}>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 size={11} className="shrink-0 text-emerald-500" />
                    <span className="text-[11px] font-semibold truncate text-emerald-600" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      {item.collectFrom}
                    </span>
                  </div>
                </div>

                {/* 60-day countdown */}
                <ClaimCountdownBar dateStr={item.date} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#E5E7EB]">
        <p className="text-xs text-gray-400 order-2 sm:order-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {filtered.length === 0 ? 0 : (safePage - 1) * BROWSE_PAGE_SIZE + 1}
          </span>
          {" – "}
          <span className="font-semibold text-gray-700">{Math.min(safePage * BROWSE_PAGE_SIZE, filtered.length)}</span>
          {" of "}
          <span className="font-semibold text-gray-700">{filtered.length}</span> items
        </p>

        <div className="flex items-center gap-1.5 order-1 sm:order-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-gray-600 hover:bg-[#0891B2] hover:text-white hover:border-[#0891B2] disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            ← Previous
          </button>

          {pageNumbers.map(n => (
            <button
              key={n}
              onClick={() => setCurrentPage(n)}
              className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all duration-150 shadow-sm ${
                safePage === n
                  ? "bg-[#0891B2] border-[#0891B2] text-white shadow-md"
                  : "border-[#E5E7EB] bg-white text-gray-600 hover:bg-[#0891B2] hover:text-white hover:border-[#0891B2]"
              }`}
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white text-xs font-semibold text-gray-600 hover:bg-[#0891B2] hover:text-white hover:border-[#0891B2] disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Next →
          </button>
        </div>
      </div>

    </div>
  );
}

function StudentView() {
  const [activeNav, setActiveNav] = useState("found-items");

  const renderContent = () => {
    switch (activeNav) {
      case "found-items": return <CombinedItemsPage initialFilter="found" />;
      case "categories":  return <CategoriesStudentPage />;
      case "guidelines":  return <GuidelinesPage />;
      default:            return <CombinedItemsPage initialFilter="found" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4ff]">
      <StudentSidebar active={activeNav} setActive={setActiveNav} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search items..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={17} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">JD</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-5">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// ─── Logout Confirm Modal ──────────────────────────────────────────────────

function LogoutModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        transition: "background 0.25s, backdrop-filter 0.25s",
        backdropFilter: visible ? "blur(4px)" : "blur(0px)",
        background: visible ? "rgba(15,23,42,0.55)" : "rgba(15,23,42,0)",
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transition: "opacity 0.25s, transform 0.25s",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.93)",
        }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 flex flex-col items-center text-center"
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle size={26} className="text-red-500" />
        </div>

        {/* Title */}
        <h2
          className="text-gray-900 mb-2"
          style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.1rem", fontWeight: 700 }}
        >
          Confirm Logout
        </h2>

        {/* Message */}
        <p
          className="text-gray-500 text-sm leading-relaxed mb-7"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          Are you sure you want to logout from <span className="font-semibold text-gray-700">KJU Lost and Found</span>?
        </p>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 hover:border-gray-300 transition-all duration-150"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-700 text-white text-sm font-semibold hover:bg-red-800 active:bg-red-900 transition-all duration-150 shadow-sm"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────

function DeleteConfirmModal({
  onConfirm, onClose, itemName, itemId, itemType,
}: {
  onConfirm: () => void;
  onClose: () => void;
  itemName: string;
  itemId: string;
  itemType: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const typeColor = itemType === "Lost Item"
    ? { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" }
    : itemType === "Found Item"
    ? { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" }
    : { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" };

  return (
    <div
      onClick={onClose}
      style={{
        transition: "background 0.25s, backdrop-filter 0.25s",
        backdropFilter: visible ? "blur(4px)" : "blur(0px)",
        background: visible ? "rgba(15,23,42,0.55)" : "rgba(15,23,42,0)",
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transition: "opacity 0.25s, transform 0.25s",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.93)",
          borderRadius: 20,
        }}
        className="bg-white shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Red top bar */}
        <div className="bg-red-500 px-6 pt-7 pb-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <Trash2 size={22} className="text-white" />
          </div>
          <h2 className="text-white" style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.15rem", fontWeight: 700 }}>
            Delete Item
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6 flex flex-col items-center text-center">
          <p className="text-gray-700 text-sm leading-relaxed mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Are you sure you want to delete
          </p>
          <p className="text-gray-900 font-semibold text-sm mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
            "{itemName}"?
          </p>

          {/* Item details card */}
          <div className={`w-full ${typeColor.bg} border ${typeColor.border} rounded-xl p-4 mb-4 text-left`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Item Details
            </p>
            <p className="text-gray-900 font-semibold text-sm mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {itemName}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>ID: {itemId}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColor.badge}`}>
                {itemType}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-center gap-1.5 mb-6">
            <AlertCircle size={13} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-xs font-medium" style={{ fontFamily: "DM Sans, sans-serif" }}>
              This action cannot be undone.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-150"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-150 shadow-sm flex items-center justify-center gap-2"
              style={{ background: "#EF4444", fontFamily: "DM Sans, sans-serif" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#DC2626")}
              onMouseLeave={e => (e.currentTarget.style.background = "#EF4444")}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Return Confirm Modal ───────────────────────────────────────────────────

function ReturnConfirmModal({
  itemName, itemId, itemType, onConfirm, onClose,
}: {
  itemName: string;
  itemId: string;
  itemType: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(raf); document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        backdropFilter: visible ? "blur(4px)" : "blur(0px)",
        background: visible ? "rgba(15,23,42,0.55)" : "rgba(15,23,42,0)",
        transition: "background 0.25s, backdrop-filter 0.25s",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 20,
          boxShadow: "0 25px 60px #00000030, 0 8px 20px #0000001a",
          width: "100%", maxWidth: 420, overflow: "hidden",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.93)",
          transition: "opacity 0.25s, transform 0.25s",
        }}
      >
        {/* Green header */}
        <div style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", padding: "24px 24px 20px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <CheckCircle size={24} style={{ color: "white" }} />
          </div>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "white", margin: 0 }}>
            Confirm Item Return
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#374151", textAlign: "center", margin: 0 }}>
            Are you sure this item has been successfully returned to its owner?
          </p>

          {/* Item details */}
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Item Details
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 6 }}>{itemName}</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#6b7280" }}>ID: {itemId}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontFamily: "DM Sans, sans-serif" }}>
                <span style={{ background: "#fef3c7", color: "#d97706", padding: "1px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Not Returned</span>
                <span style={{ color: "#9ca3af" }}>→</span>
                <span style={{ background: "#dcfce7", color: "#16a34a", padding: "1px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Returned</span>
              </span>
            </div>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "#6b7280", marginTop: 6 }}>Type: {itemType}</p>
          </div>

          {/* Warning */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px" }}>
            <AlertTriangle size={14} style={{ color: "#d97706", marginTop: 1, flexShrink: 0 }} />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#92400e", margin: 0 }}>
              Once marked as <strong>Returned</strong>, this action cannot be reversed. The status will be permanently locked.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid #d1d5db", background: "white", color: "#374151", fontSize: 14, fontWeight: 500, fontFamily: "DM Sans, sans-serif", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#22c55e", color: "white", fontSize: 14, fontWeight: 600, fontFamily: "DM Sans, sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#16a34a"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#22c55e"; }}
            >
              <CheckCircle size={14} />
              Confirm Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Item History Page ─────────────────────────────────────────────────────

function ItemHistoryPage({ foundItems, lostItems, disposedHistory, returnedLostHistory }: { foundItems: typeof adminFoundItems; lostItems: typeof adminLostItems; disposedHistory: DisposedRecord[]; returnedLostHistory: ReturnedLostRecord[] }) {
  const [activeTab, setActiveTab] = useState<"returned" | "lost-not-found" | "disposed">("returned");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Returned: seed records from claimedItems + dynamic records from Lost/Found
  const returnedItems = [
    ...claimedItems.map((i, idx) => ({
      id: -(idx + 1), name: i.item, type: i.type as "Lost" | "Found",
      reportedDate: i.returnedDate, closedDate: i.returnedDate,
      studentName: i.student, rollNo: i.id, location: "—",
      reporter: i.student, reporterPhone: "", reporterEmail: "",
    })),
    ...returnedLostHistory.map(i => ({
      id: i.id, name: i.name, type: "Lost" as const,
      reportedDate: i.reportedDate, closedDate: i.closedDate,
      studentName: i.studentName, rollNo: i.rollNo, location: i.location,
      reporter: i.reporter, reporterPhone: i.reporterPhone, reporterEmail: i.reporterEmail,
    })),
    ...lostItems.filter(i => i.status === "Returned").map(i => ({
      id: i.id, name: i.name, type: "Lost" as const,
      reportedDate: i.dateFound, closedDate: i.claimedDate || i.lastUpdated,
      studentName: i.studentName, rollNo: i.rollNo, location: i.location,
      reporter: i.reporterName, reporterPhone: i.reporterPhone, reporterEmail: i.reporterEmail,
    })),
    ...foundItems.filter(i => i.status === "Returned").map(i => ({
      id: i.id, name: i.name, type: "Found" as const,
      reportedDate: i.dateFound, closedDate: i.returnedDate || i.lastUpdated,
      studentName: i.studentName, rollNo: i.rollNo, location: i.location,
      reporter: "", reporterPhone: "", reporterEmail: "",
    })),
  ];

  const filterRow = (row: { name: string; type: string; reportedDate: string; location: string; reporter: string }, closedDate?: string) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || row.name.toLowerCase().includes(q) || row.location.toLowerCase().includes(q) || row.reporter.toLowerCase().includes(q);
    const matchesType = !filterType || row.type === filterType;
    const d = parseDateForCountdown(row.reportedDate);
    const matchesFrom = !dateFrom || d >= new Date(dateFrom);
    const matchesTo   = !dateTo   || d <= new Date(dateTo);
    return matchesSearch && matchesType && matchesFrom && matchesTo;
  };

  const filteredReturned = returnedItems.filter(r => filterRow(r, r.closedDate));
  // Lost & Not Found: lost items that expired (60+ days) and were never returned
  const lostNotFoundItems = lostItems
    .filter(i => i.status === "Not Returned" && getDaysInfo(i.dateFound).isExpired)
    .map(i => ({
      id: i.id, name: i.name, reportedDate: i.dateFound,
      location: i.location, reporter: i.reporterName,
      reporterPhone: i.reporterPhone, reporterEmail: i.reporterEmail,
      daysElapsed: getDaysInfo(i.dateFound).daysElapsed,
    }));

  const filteredLostNotFound = lostNotFoundItems.filter(r => {
    const q = searchTerm.toLowerCase();
    return (!q || r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.reporter.toLowerCase().includes(q));
  });

  const filteredDisposed = disposedHistory.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.reporter.toLowerCase().includes(q) || r.donatedTo.toLowerCase().includes(q);
    const matchesType = !filterType || r.type === filterType;
    try {
      const d = parseDateForCountdown(r.reportedDate);
      const matchesFrom = !dateFrom || d >= new Date(dateFrom);
      const matchesTo = !dateTo || d <= new Date(dateTo);
      return matchesSearch && matchesType && matchesFrom && matchesTo;
    } catch { return matchesSearch && matchesType; }
  });

  const inputCls = "w-full bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all py-2.5";

  return (
    <main className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>Disposed &amp; Returned History</h1>
        <p className="text-gray-500 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>Permanent record of all returned and disposed items</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Returned",    value: returnedItems.length,       dot: "bg-emerald-500", card: "bg-emerald-50 border-emerald-200", txt: "text-emerald-700" },
          { label: "Lost & Not Found",  value: lostNotFoundItems.length,   dot: "bg-red-400",     card: "bg-red-50 border-red-200",         txt: "text-red-700" },
          { label: "Disposed Items",    value: disposedHistory.length,     dot: "bg-gray-400",    card: "bg-gray-50 border-gray-200",       txt: "text-gray-600" },
          { label: "Found → Returned",  value: returnedItems.filter(r => r.type === "Found").length, dot: "bg-cyan-500", card: "bg-cyan-50 border-cyan-200", txt: "text-cyan-700" },
        ].map((s, i) => (
          <div key={i} className={`border rounded-2xl p-4 flex items-center gap-3 shadow-sm ${s.card}`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
            <div>
              <p className={`text-2xl font-bold ${s.txt}`} style={{ fontFamily: "Outfit, sans-serif" }}>{s.value}</p>
              <p className={`text-[10px] font-semibold ${s.txt}`} style={{ fontFamily: "DM Sans, sans-serif" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm w-fit mb-4">
        {([
          { id: "returned", label: `Returned (${returnedItems.length})`, color: "bg-emerald-500" },
          { id: "lost-not-found", label: `Lost & Not Found (${lostNotFoundItems.length})`, color: "bg-red-500" },
          { id: "disposed", label: `Disposed (${disposedHistory.length})`, color: "bg-gray-500" },
        ] as { id: "returned" | "lost-not-found" | "disposed"; label: string; color: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === t.id ? `${t.color} text-white shadow-sm` : "text-gray-500 hover:bg-gray-50"}`}
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search name, location…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={inputCls + " pl-9"} style={{ fontFamily: "DM Sans, sans-serif" }} />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className={inputCls + " px-3 appearance-none"} style={{ fontFamily: "DM Sans, sans-serif" }}>
            <option value="">All Types</option>
            <option value="Lost">Lost Items</option>
            <option value="Found">Found Items</option>
          </select>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className={inputCls + " pl-9"} style={{ fontFamily: "DM Sans, sans-serif" }} />
          </div>
        </div>
        {(searchTerm || filterType || dateFrom || dateTo) && (
          <button onClick={() => { setSearchTerm(""); setFilterType(""); setDateFrom(""); setDateTo(""); }}
            className="mt-2 text-xs text-cyan-600 hover:underline font-medium" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {activeTab === "returned"
                  ? ["Item Name", "Type", "Reported Date", "Returned Date", "Location", "Student", "Roll No", "Reporter"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}>{h}</th>
                    ))
                  : activeTab === "lost-not-found"
                  ? ["Item Name", "Reported Date", "Location", "Days Elapsed", "Reporter"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}>{h}</th>
                    ))
                  : ["Item Name", "Disposed Date", "Donated To"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}>{h}</th>
                    ))
                }
              </tr>
            </thead>
            <tbody>
              {activeTab === "lost-not-found" ? (
                filteredLostNotFound.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">No lost &amp; not found items yet. Lost items unclaimed after 60 days will appear here.</td></tr>
                ) : filteredLostNotFound.map((item, i) => {
                  const elapsed = Math.floor((new Date().getTime() - new Date(item.dateFound).getTime()) / 86400000);
                  return (
                    <tr key={`lnf-${item.id}`} className={`border-b border-gray-100 hover:bg-red-50/30 transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}>{item.name}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.dateFound}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[120px]"><span className="truncate block">{item.location}</span></td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{elapsed}d</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.reporter || "—"}</td>
                    </tr>
                  );
                })
              ) : activeTab === "returned" ? (
                filteredReturned.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">No returned items found</td></tr>
                ) : filteredReturned.map((item, i) => (
                  <tr key={`ret-${item.type}-${item.id}`} className={`border-b border-gray-100 hover:bg-emerald-50/30 transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}>{item.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.type === "Lost" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{item.type}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.reportedDate}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.closedDate || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[120px]"><span className="truncate block">{item.location}</span></td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{item.studentName || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{item.rollNo || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.reporter || "—"}</td>
                  </tr>
                ))
              ) : (
                filteredDisposed.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-10 text-center text-gray-400 text-sm">No disposed items yet. Items disposed from the Expired Items module will appear here.</td></tr>
                ) : filteredDisposed.map((item, i) => (
                  <tr key={`dis-${item.type}-${item.id}-${i}`} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}>{item.name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.disposedDate}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-50 text-pink-600">
                        {item.donatedTo || item.disposalLocation || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// ─── Expired Items Page ────────────────────────────────────────────────────

const SOCIAL_CLUBS = ["NSS", "KCDC", "NCC", "Other"];

function ExpiredItemsPage({
  foundItems, lostItems, setFoundItems, setLostItems, onDispose,
}: {
  foundItems: typeof adminFoundItems;
  lostItems: typeof adminLostItems;
  setFoundItems: React.Dispatch<React.SetStateAction<typeof adminFoundItems>>;
  setLostItems: React.Dispatch<React.SetStateAction<typeof adminLostItems>>;
  onDispose: (record: DisposedRecord) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string; type: "Lost" | "Found"; reportedDate: string; location: string; reporter: string; reporterPhone: string; reporterEmail: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [disposalLocation, setDisposalLocation] = useState("");
  const [donatedTo, setDonatedTo] = useState("None");
  const [notes, setNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const expiredFound = foundItems
    .filter(i => i.status === "Not Returned" && getDaysInfo(i.dateFound).isExpired)
    .map(i => ({ id: i.id, name: i.name, type: "Found" as const, reportedDate: i.dateFound, location: i.location, reporter: "", reporterPhone: "", reporterEmail: "", daysElapsed: getDaysInfo(i.dateFound).daysElapsed }));

  const allExpired = expiredFound
    .filter(i => {
      const q = searchTerm.toLowerCase();
      return !q || i.name.toLowerCase().includes(q) || i.location.toLowerCase().includes(q);
    })
    .sort((a, b) => b.daysElapsed - a.daysElapsed);

  const openModal = (item: typeof allExpired[0]) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setSelectedItem(item);
    setDisposalLocation("");
    setDonatedTo("None");
    setNotes("");
    setShowConfirm(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setModalVisible(true)));
  };

  const closeModal = () => {
    setModalVisible(false);
    closeTimerRef.current = setTimeout(() => setSelectedItem(null), 260);
  };

  const handleSubmitDisposal = () => {
    if (!selectedItem || !disposalLocation.trim()) return;
    const now = formatNow();
    const record: DisposedRecord = {
      id: selectedItem.id,
      name: selectedItem.name,
      type: selectedItem.type,
      reportedDate: selectedItem.reportedDate,
      location: selectedItem.location,
      reporter: selectedItem.reporter,
      reporterPhone: selectedItem.reporterPhone,
      reporterEmail: selectedItem.reporterEmail,
      disposalLocation: disposalLocation.trim(),
      donatedTo: donatedTo === "None" ? "" : donatedTo,
      disposedDate: now,
      notes: notes.trim(),
    };
    if (selectedItem.type === "Found") {
      setFoundItems(prev => prev.filter(i => i.id !== selectedItem.id));
    } else {
      setLostItems(prev => prev.filter(i => i.id !== selectedItem.id));
    }
    onDispose(record);
    closeModal();
    toast.success("Item marked as disposed", {
      description: `${selectedItem.name} has been moved to History.`,
      duration: 3500,
    });
  };

  const fLabel = "block text-xs font-semibold text-gray-600 mb-1.5";
  const fInput = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all";

  return (
    <main className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Recycle size={18} className="text-gray-500" />
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>Expired Items – Awaiting Disposal</h1>
        </div>
        <p className="text-gray-600 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>Items unclaimed for 60+ days. Mark each item as disposed and optionally donate to a social service club.</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Total Expired", value: expiredFound.length, cls: "bg-gray-50 border-gray-200", txt: "text-gray-700", dot: "bg-gray-500" },
          { label: "Found Items", value: expiredFound.length, cls: "bg-emerald-50 border-emerald-200", txt: "text-emerald-700", dot: "bg-emerald-500" },
        ].map((c, i) => (
          <div key={i} className={`border rounded-xl p-4 flex items-center gap-3 ${c.cls}`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
            <div>
              <p className={`text-2xl font-bold ${c.txt}`} style={{ fontFamily: "Outfit, sans-serif" }}>{c.value}</p>
              <p className={`text-[10px] font-semibold ${c.txt}`} style={{ fontFamily: "DM Sans, sans-serif" }}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name or location…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              style={{ fontFamily: "DM Sans, sans-serif" }} />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2" style={{ fontFamily: "DM Sans, sans-serif" }}>{allExpired.length} expired item{allExpired.length !== 1 ? "s" : ""} awaiting disposal</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Item Name", "Found Date", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allExpired.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-14 text-center" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Package size={32} className="opacity-30" />
                      <p className="text-sm font-medium">No expired items</p>
                      <p className="text-xs">All items have been claimed within the 60-day window.</p>
                    </div>
                  </td>
                </tr>
              ) : allExpired.map((item, i) => (
                <tr key={`exp-${item.id}`} className={`border-b border-gray-100 hover:bg-gray-50/60 transition-colors ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}>{item.name}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.reportedDate}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openModal(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-semibold transition-all"
                      style={{ fontFamily: "DM Sans, sans-serif" }}
                    >
                      <Recycle size={11} /> Mark Disposed
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disposal Modal */}
      {selectedItem && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
            background: modalVisible ? "rgba(15,23,42,0.52)" : "rgba(15,23,42,0)",
            backdropFilter: modalVisible ? "blur(4px)" : "blur(0px)",
            transition: "background 0.25s ease, backdrop-filter 0.25s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "white", borderRadius: "14px",
              boxShadow: "0 25px 60px #00000030, 0 8px 20px #0000001a",
              width: "100%", maxWidth: "500px", maxHeight: "92vh", overflowY: "auto",
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? "scale(1) translateY(0)" : "scale(0.96) translateY(10px)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
            }}
          >
            {/* Header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Recycle size={16} className="text-gray-600" />
                </div>
                <div>
                  <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#111827", margin: 0 }}>Mark Item as Disposed</h2>
                  <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>Record disposal details for this expired item</p>
                </div>
              </div>
              <button onClick={closeModal}
                style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Item info */}
              <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#6b7280" }}>Item</span>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, fontWeight: 600, color: "#111827" }}>{selectedItem.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#6b7280" }}>Type</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${selectedItem.type === "Lost" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{selectedItem.type}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#6b7280" }}>Date Reported</span>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#374151" }}>{selectedItem.reportedDate}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#6b7280" }}>Found Location</span>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#374151" }}>{selectedItem.location}</span>
                </div>
              </div>

              {/* Club selector */}
              <div>
                <label className={fLabel} style={{ fontFamily: "DM Sans, sans-serif" }}>Donate to Social Services Club for Further Disposal <span style={{ color: "#ef4444" }}>*</span></label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {["KCDC", "NSS", "NCC", "Others"].map(club => (
                    <button key={club} type="button"
                      onClick={() => setDisposalLocation(club)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${disposalLocation === club ? "bg-pink-500 text-white border-pink-500" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                      style={{ fontFamily: "DM Sans, sans-serif" }}>
                      {club}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={fLabel} style={{ fontFamily: "DM Sans, sans-serif" }}>Notes <span style={{ color: "#9ca3af", fontWeight: 400 }}>(Optional)</span></label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Additional disposal notes…" className={fInput}
                  style={{ fontFamily: "DM Sans, sans-serif", resize: "none" }} />
              </div>
            </div>

            {/* Footer */}
            {!showConfirm ? (
              <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
                <button onClick={closeModal}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "1px solid #d1d5db", background: "white", color: "#374151", fontSize: 14, fontWeight: 500, fontFamily: "DM Sans, sans-serif", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={() => setShowConfirm(true)} disabled={!disposalLocation.trim()}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 9, border: "none",
                    background: disposalLocation.trim() ? "#1f2937" : "#e5e7eb",
                    color: disposalLocation.trim() ? "white" : "#9ca3af",
                    fontSize: 14, fontWeight: 600, fontFamily: "DM Sans, sans-serif",
                    cursor: disposalLocation.trim() ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                  <Recycle size={14} /> Confirm Disposal
                </button>
              </div>
            ) : (
              <div style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px", fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "#92400e" }}>
                  ⚠ Are you sure you want to dispose <strong>{selectedItem?.name}</strong> by donating to <strong>{disposalLocation}</strong>? This action cannot be undone.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowConfirm(false)}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "1px solid #d1d5db", background: "white", color: "#374151", fontSize: 14, fontWeight: 500, fontFamily: "DM Sans, sans-serif", cursor: "pointer" }}>
                    Go Back
                  </button>
                  <button onClick={handleSubmitDisposal}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 9, border: "none",
                      background: "#dc2626", color: "white",
                      fontSize: 14, fontWeight: 600, fontFamily: "DM Sans, sans-serif",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                    <Recycle size={14} /> Yes, Dispose Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Admin View ────────────────────────────────────────────────────────────

function AdminSidebar({ active, setActive, onLogoutRequest }: { active: string; setActive: (s: string) => void; onLogoutRequest: () => void }) {
  const sections = [
    {
      label: "ITEMS",
      items: [
        { id: "lost-items", icon: <AlertCircle size={15} />, label: "Lost Items" },
        { id: "found-items", icon: <CheckSquare size={15} />, label: "Found Items" },
        { id: "expired-items", icon: <Recycle size={15} />, label: "Expired Items" },
        { id: "upload-item", icon: <Upload size={15} />, label: "Report Item" },
      ],
    },
    {
      label: "RECORDS",
      items: [
        { id: "history", icon: <BookOpen size={15} />, label: "Disposed & Returned History" },
      ],
    },
    {
      label: "MANAGE",
      items: [
        { id: "guidelines", icon: <BookOpen size={15} />, label: "Guidelines" },
        { id: "settings", icon: <Settings size={15} />, label: "Settings" },
      ],
    },
  ];

  return (
    <aside className="w-52 bg-white flex flex-col min-h-screen shrink-0 border-r border-gray-200">
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <img
            src={campusLogo}
            alt="Campus Logo"
            className="w-8 h-8 object-contain"
          />
          <div>
            <p className="text-gray-900 font-semibold text-sm leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>Campus</p>
            <p className="text-cyan-600 text-[10px] leading-tight">Lost &amp; Found</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {sections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="text-[9px] font-semibold text-gray-400 tracking-widest px-3 mb-1.5">{section.label}</p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                    active === item.id
                      ? "bg-cyan-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">A</div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-900 text-xs font-medium truncate" style={{ fontFamily: "Outfit, sans-serif" }}>Admin</p>
            <p className="text-gray-500 text-[10px] truncate">admin@campus.edu</p>
          </div>
          <button
            onClick={onLogoutRequest}
            title="Logout"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 hover:shadow-sm transition-all duration-150"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

const ADMIN_ROWS_OPTIONS = [10, 25, 50, 100];

// ─── 60-Day Countdown Helpers ─────────────────────────────────────────────

function parseDateForCountdown(dateStr: string): Date {
  const months: Record<string, number> = {
    Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11
  };
  const parts = dateStr.trim().split(" ");
  return new Date(Number(parts[2]), months[parts[1]], Number(parts[0]));
}

function getDaysInfo(dateStr: string) {
  const reported = parseDateForCountdown(dateStr);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysElapsed = Math.max(0, Math.floor((today.getTime() - reported.getTime()) / 86400000));
  const daysRemaining = Math.max(0, 60 - daysElapsed);
  const isExpired = daysElapsed >= 60;
  let countdownStatus: "active" | "expiring" | "last10" | "expired";
  if (isExpired) countdownStatus = "expired";
  else if (daysRemaining <= 10) countdownStatus = "last10";
  else if (daysRemaining <= 30) countdownStatus = "expiring";
  else countdownStatus = "active";
  return { daysRemaining, daysElapsed, isExpired, countdownStatus };
}

function ClaimCountdownBar({ dateStr }: { dateStr: string }) {
  const { daysRemaining, daysElapsed, isExpired, countdownStatus } = getDaysInfo(dateStr);
  const barColor = isExpired ? "#9ca3af" : countdownStatus === "last10" ? "#ef4444" : countdownStatus === "expiring" ? "#f59e0b" : "#22c55e";
  const pct = Math.min(100, (daysElapsed / 60) * 100);
  const badge =
    isExpired         ? { label: "Expired",       bg: "bg-gray-100",    text: "text-gray-500",    dot: "bg-gray-400"    } :
    countdownStatus === "last10"   ? { label: "Last 10 Days", bg: "bg-red-50",     text: "text-red-600",    dot: "bg-red-500"     } :
    countdownStatus === "expiring" ? { label: "Expiring Soon",bg: "bg-amber-50",   text: "text-amber-600",  dot: "bg-amber-400"   } :
                                     { label: "Active",        bg: "bg-emerald-50", text: "text-emerald-600",dot: "bg-emerald-400" };
  return (
    <div className={`mt-3 pt-3 border-t border-gray-100 ${isExpired ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide" style={{ fontFamily: "DM Sans, sans-serif" }}>Claim Period</span>
        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor, transition: "width 0.4s ease" }} />
      </div>
      <p className="text-[10px] text-gray-400" style={{ fontFamily: "DM Sans, sans-serif" }}>
        {isExpired ? "60-Day Limit Reached · Eligible for University Disposal Policy" : `${daysRemaining} / 60 Days Remaining`}
      </p>
    </div>
  );
}

function CountdownChip({ dateStr }: { dateStr: string }) {
  const { daysRemaining, isExpired, countdownStatus } = getDaysInfo(dateStr);
  if (isExpired) return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">⚫ Expired</span>;
  if (countdownStatus === "last10") return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 whitespace-nowrap">🔴 {daysRemaining}d</span>;
  if (countdownStatus === "expiring") return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 whitespace-nowrap">🟡 {daysRemaining}d</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 whitespace-nowrap">🟢 {daysRemaining}d</span>;
}

function CountdownSummaryCards({ items, dateField }: { items: Array<Record<string, string>>, dateField: string }) {
  const notReturned = items.filter(i => i.status === "Not Returned");
  const stats = notReturned.reduce(
    (acc, item) => { const { countdownStatus } = getDaysInfo(item[dateField]); acc[countdownStatus]++; return acc; },
    { active: 0, expiring: 0, last10: 0, expired: 0 }
  );
  const cards = [
    { label: "Total Unclaimed", value: notReturned.length, cls: "bg-cyan-50 border-cyan-200", txt: "text-cyan-700", dot: "bg-cyan-400" },
    { label: "Expiring in 30 Days", value: stats.expiring + stats.last10, cls: "bg-amber-50 border-amber-200", txt: "text-amber-700", dot: "bg-amber-400" },
    { label: "Last 10 Days", value: stats.last10, cls: "bg-red-50 border-red-200", txt: "text-red-700", dot: "bg-red-500" },
    { label: "Expired – Awaiting Removal", value: stats.expired, cls: "bg-gray-50 border-gray-200", txt: "text-gray-600", dot: "bg-gray-400" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {cards.map((c, i) => (
        <div key={i} className={`border rounded-xl p-4 flex items-center gap-3 ${c.cls}`}>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
          <div>
            <p className={`text-2xl font-bold ${c.txt}`} style={{ fontFamily: "Outfit, sans-serif" }}>{c.value}</p>
            <p className={`text-[10px] font-semibold ${c.txt}`} style={{ fontFamily: "DM Sans, sans-serif" }}>{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function parseDateTime(dt: string): number {
  const months: Record<string, number> = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
  const [datePart, timePart] = dt.split(", ");
  if (!datePart || !timePart) return 0;
  const [day, mon, year] = datePart.split(" ");
  const [time, ampm] = timePart.split(" ");
  const [h, m] = time.split(":").map(Number);
  let hours = h;
  if (ampm === "PM" && h !== 12) hours += 12;
  if (ampm === "AM" && h === 12) hours = 0;
  return new Date(Number(year), months[mon], Number(day), hours, m).getTime();
}

function AdminTablePagination({
  totalRecords, currentPage, rowsPerPage, onPageChange, onRowsPerPageChange,
}: {
  totalRecords: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (n: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = totalRecords === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(safePage * rowsPerPage, totalRecords);

  const maxVisible = 5;
  let pageStart = Math.max(1, safePage - Math.floor(maxVisible / 2));
  const pageEnd = Math.min(totalPages, pageStart + maxVisible - 1);
  if (pageEnd - pageStart + 1 < maxVisible) pageStart = Math.max(1, pageEnd - maxVisible + 1);
  const pageNumbers = Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/60">
      {/* Left: record count + rows per page */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-xs text-gray-500" style={{ fontFamily: "DM Sans, sans-serif" }}>
          Showing <span className="font-semibold text-gray-700">{start}</span>–<span className="font-semibold text-gray-700">{end}</span> of <span className="font-semibold text-gray-700">{totalRecords}</span> items
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400" style={{ fontFamily: "DM Sans, sans-serif" }}>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={e => { onRowsPerPageChange(Number(e.target.value)); onPageChange(1); }}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            {ADMIN_ROWS_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Right: page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          ← Previous
        </button>

        {pageStart > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="w-8 h-8 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all duration-150 shadow-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>1</button>
            {pageStart > 2 && <span className="text-gray-400 text-xs px-1">…</span>}
          </>
        )}

        {pageNumbers.map(n => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={`w-8 h-8 text-xs rounded-lg border transition-all duration-150 shadow-sm ${
              safePage === n
                ? "bg-cyan-600 border-cyan-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-600"
            }`}
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            {n}
          </button>
        ))}

        {pageEnd < totalPages && (
          <>
            {pageEnd < totalPages - 1 && <span className="text-gray-400 text-xs px-1">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="w-8 h-8 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all duration-150 shadow-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function LostItemsPage({ items, setItems, onReturn }: { items: typeof adminLostItems; setItems: React.Dispatch<React.SetStateAction<typeof adminLostItems>>; onReturn: (r: ReturnedLostRecord) => void }) {
  const [editItem, setEditItem] = useState<typeof adminLostItems[0] | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editStudentName, setEditStudentName] = useState("");
  const [editRollNo, setEditRollNo] = useState("");
  const [editClaimedDate, setEditClaimedDate] = useState("");
  const [pendingReturnItem, setPendingReturnItem] = useState<typeof adminLostItems[0] | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCountdown, setFilterCountdown] = useState("");

  const statusColor = (s: string) =>
    s === "Returned" ? "text-emerald-600 bg-emerald-100" : "text-amber-600 bg-amber-100";

  const filteredItems = items
    .filter(item => {
      if (item.status === "Returned") return false;
      if (item.status === "Not Returned" && getDaysInfo(item.dateFound).isExpired) return false;
      const q = searchTerm.toLowerCase();
      const matchesSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.reporterName.toLowerCase().includes(q) ||
        item.reportedAt.toLowerCase().includes(q);
      const matchesLocation = !filterLocation || item.location.toLowerCase().includes(filterLocation.toLowerCase());
      const matchesCountdown = !filterCountdown || getDaysInfo(item.dateFound).countdownStatus === filterCountdown;
      return matchesSearch && matchesLocation && matchesCountdown;
    })
    .sort((a, b) => parseDateTime(b.reportedAt) - parseDateTime(a.reportedAt));

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filteredItems.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const clearFilters = () => { setSearchTerm(""); setFilterLocation(""); setCurrentPage(1); };

  const confirmDelete = () => {
    if (pendingDeleteId !== null) { setItems(items.filter(i => i.id !== pendingDeleteId)); setPendingDeleteId(null); }
  };

  const handleEdit = (item: typeof adminLostItems[0]) => {
    if (item.status === "Returned") return;
    setEditItem(item); setEditStatus(item.status);
    setEditStudentName(item.studentName || ""); setEditRollNo(item.rollNo || ""); setEditClaimedDate(item.claimedDate || "");
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    if (editStatus === "Returned") {
      setPendingReturnItem(editItem);
      setEditItem(null);
      return;
    }
    setItems(items.map(item =>
      item.id === editItem.id ? {
        ...item, status: editStatus,
        studentName: "", rollNo: "", claimedDate: "",
        lastUpdated: formatNow(),
      } : item
    ));
    setEditItem(null);
  };

  const confirmReturn = () => {
    if (!pendingReturnItem) return;
    const now = formatNow();
    onReturn({
      id: pendingReturnItem.id,
      name: pendingReturnItem.name,
      reportedDate: pendingReturnItem.dateFound,
      closedDate: now,
      studentName: editStudentName,
      rollNo: editRollNo,
      location: pendingReturnItem.location,
      reporter: pendingReturnItem.reporterName,
      reporterPhone: pendingReturnItem.reporterPhone,
      reporterEmail: pendingReturnItem.reporterEmail,
    });
    setItems(prev => prev.filter(i => i.id !== pendingReturnItem.id));
    setPendingReturnItem(null);
    toast.success("Item marked as Returned", {
      description: `${pendingReturnItem.name} has been moved to Returned History.`,
      duration: 3500,
    });
  };

  return (
    <main className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>Lost Items</h1>
        <p className="text-gray-600 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>Manage all lost items reported on campus</p>
      </div>

      {/* Countdown Summary Cards */}
      <CountdownSummaryCards items={items as Array<Record<string, string>>} dateField="dateFound" />

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, location, reporter, or date…"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by location..."
              value={filterLocation}
              onChange={e => { setFilterLocation(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            />
          </div>
        </div>
        {/* Countdown filter row */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500 font-medium shrink-0" style={{ fontFamily: "DM Sans, sans-serif" }}>Countdown:</span>
          {[
            { value: "", label: "All" },
            { value: "active", label: "🟢 Active" },
            { value: "expiring", label: "🟡 Expiring Soon" },
            { value: "last10", label: "🔴 Last 10 Days" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { setFilterCountdown(opt.value); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filterCountdown === opt.value ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: "DM Sans, sans-serif" }}>
          {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} found · sorted by newest first
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Name", "Reported Date & Time", "Location", "Reporter", "Days Left", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-600 font-semibold text-[11px] uppercase tracking-wide whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    No items found matching your search criteria
                  </td>
                </tr>
              ) : pageItems.map((item, i) => (
                <tr key={item.id} className={`border-b border-gray-100 hover:bg-cyan-50/30 transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}>
                  <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}><CardNameTooltip name={item.name} /></td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-gray-700">{item.reportedAt.split(", ")[0]}</div>
                    <div className="text-gray-400 text-[10px]">{item.reportedAt.split(", ")[1]}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[130px]">
                    <span className="truncate block">{item.location}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.reporterName}</p>
                      <p className="text-[10px] text-gray-500">{item.reporterRoll}</p>
                      <p className="text-[10px] text-gray-500">{item.reporterPhone}</p>
                      <p className="text-[10px] text-cyan-600">{item.reporterEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <CountdownChip dateStr={item.dateFound} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="text-cyan-600 hover:text-cyan-700 p-1 rounded hover:bg-cyan-50 transition-colors" title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setPendingDeleteId(item.id)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-150" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AdminTablePagination
          totalRecords={filteredItems.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={n => { setRowsPerPage(n); setCurrentPage(1); }}
        />
      </div>

      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Edit Item Status</h2>
            <p className="text-xs text-gray-400 mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>Changing to "Returned" requires confirmation</p>
            <div className="space-y-4">
              {/* Item name read-only */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
                <span className="text-xs text-gray-500" style={{ fontFamily: "DM Sans, sans-serif" }}>Item:</span>
                <span className="text-sm font-semibold text-gray-900" style={{ fontFamily: "DM Sans, sans-serif" }}>{editItem.name}</span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>Status <span className="text-red-400">*</span></label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  <option value="Not Returned">Not Returned</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditItem(null)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 font-medium text-sm transition-colors" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {editStatus === "Returned" ? "Continue →" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingReturnItem && (
        <ReturnConfirmModal
          itemName={pendingReturnItem.name}
          itemId={`LOST-${String(pendingReturnItem.id).padStart(3, "0")}`}
          itemType="Lost Item"
          onConfirm={confirmReturn}
          onClose={() => setPendingReturnItem(null)}
        />
      )}

      {pendingDeleteId !== null && (() => {
        const target = items.find(i => i.id === pendingDeleteId);
        return (
          <DeleteConfirmModal
            onConfirm={confirmDelete}
            onClose={() => setPendingDeleteId(null)}
            itemName={target?.name ?? ""}
            itemId={`LOST-${String(pendingDeleteId).padStart(3, "0")}`}
            itemType="Lost Item"
          />
        );
      })()}
    </main>
  );
}

function formatNow(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mon = months[now.getMonth()];
  const year = now.getFullYear();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${day} ${mon} ${year}, ${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

function FoundItemsPage({ items, setItems, onReturn }: { items: typeof adminFoundItems; setItems: React.Dispatch<React.SetStateAction<typeof adminFoundItems>>; onReturn: (r: ReturnedLostRecord) => void }) {
  const [editItem, setEditItem] = useState<typeof adminFoundItems[0] | null>(null);
  const [pendingReturnItem, setPendingReturnItem] = useState<typeof adminFoundItems[0] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [editStatus, setEditStatus] = useState("");
  const [editStudentName, setEditStudentName] = useState("");
  const [editRollNo, setEditRollNo] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editReturnedDate, setEditReturnedDate] = useState("");
  const [editReturnedTime, setEditReturnedTime] = useState("");
  const [editRemarks, setEditRemarks] = useState("");

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCountdown, setFilterCountdown] = useState("");

  const filteredItems = items
    .filter(item => {
      if (item.status === "Returned") return false;
      if (item.status === "Not Returned" && getDaysInfo(item.dateFound).isExpired) return false;
      const q = searchTerm.toLowerCase();
      const matchesSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.foundAt.toLowerCase().includes(q);
      const matchesLocation = !filterLocation || item.location.toLowerCase().includes(filterLocation.toLowerCase());
      const matchesCountdown = !filterCountdown || getDaysInfo(item.dateFound).countdownStatus === filterCountdown;
      return matchesSearch && matchesLocation && matchesCountdown;
    })
    .sort((a, b) => parseDateTime(b.foundAt) - parseDateTime(a.foundAt));

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filteredItems.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const clearFilters = () => { setSearchTerm(""); setFilterLocation(""); setFilterCountdown(""); setCurrentPage(1); };

  const confirmDelete = () => {
    if (pendingDeleteId !== null) { setItems(items.filter(i => i.id !== pendingDeleteId)); setPendingDeleteId(null); }
  };

  const openModal = (item: typeof adminFoundItems[0]) => {
    if (item.status === "Returned") return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setEditItem(item);
    setEditStatus(item.status);
    setEditStudentName(item.studentName || "");
    setEditRollNo(item.rollNo || "");
    setEditPhone("");
    setEditEmail("");
    setEditReturnedDate(item.returnedDate || "");
    setEditReturnedTime("");
    setEditRemarks("");
    requestAnimationFrame(() => requestAnimationFrame(() => setModalVisible(true)));
  };

  const closeModal = () => {
    setModalVisible(false);
    closeTimerRef.current = setTimeout(() => setEditItem(null), 260);
  };

  const isReturnValid = editStatus !== "Returned" || (!!editStudentName && !!editRollNo && !!editPhone && !!editEmail && !!editReturnedDate && !!editReturnedTime);

  const handleSaveEdit = () => {
    if (!editItem || !isReturnValid) return;
    if (editStatus === "Returned") {
      setPendingReturnItem(editItem);
      closeModal();
      return;
    }
    const now = formatNow();
    setItems(prev => prev.map(item =>
      item.id === editItem.id ? {
        ...item,
        status: editStatus,
        studentName: "", rollNo: "", returnedDate: "",
        lastUpdated: now,
      } : item
    ));
    closeModal();
    toast.success("Item updated successfully", {
      description: `${editItem.name} status updated.`,
      duration: 3500,
    });
  };

  const confirmReturn = () => {
    if (!pendingReturnItem) return;
    const now = formatNow();
    onReturn({
      id: pendingReturnItem.id,
      name: pendingReturnItem.name,
      reportedDate: pendingReturnItem.dateFound,
      closedDate: now,
      studentName: editStudentName,
      rollNo: editRollNo,
      location: pendingReturnItem.location,
      reporter: "",
      reporterPhone: "",
      reporterEmail: "",
    });
    setItems(prev => prev.filter(i => i.id !== pendingReturnItem.id));
    setPendingReturnItem(null);
    toast.success("Item marked as Returned", {
      description: `${pendingReturnItem.name} has been moved to Returned History.`,
      duration: 3500,
    });
  };

  const fLabel = "block text-xs font-semibold text-gray-600 mb-1.5";
  const fInput = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all";

  return (
    <main className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>Found Items</h1>
        <p className="text-gray-600 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>Manage all found items on campus</p>
      </div>

      {/* Countdown Summary Cards */}
      <CountdownSummaryCards items={items as Array<Record<string, string>>} dateField="dateFound" />

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, location, or date…"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by location..."
              value={filterLocation}
              onChange={e => { setFilterLocation(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            />
          </div>
        </div>
        {/* Countdown filter row */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500 font-medium shrink-0" style={{ fontFamily: "DM Sans, sans-serif" }}>Countdown:</span>
          {[
            { value: "", label: "All" },
            { value: "active", label: "🟢 Active" },
            { value: "expiring", label: "🟡 Expiring Soon" },
            { value: "last10", label: "🔴 Last 10 Days" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { setFilterCountdown(opt.value); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filterCountdown === opt.value ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: "DM Sans, sans-serif" }}>
          {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} found · sorted by newest first
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Name", "Found Date & Time", "Location", "Days Left", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-600 font-semibold text-[11px] uppercase tracking-wide whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500 text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    No items found matching your search criteria
                  </td>
                </tr>
              ) : pageItems.map((item, i) => (
                <tr key={item.id} className={`border-b border-gray-100 hover:bg-cyan-50/30 transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}>
                  <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap" style={{ fontFamily: "DM Sans, sans-serif" }}>{item.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-gray-700">{item.foundAt.split(", ")[0]}</div>
                    <div className="text-gray-400 text-[10px]">{item.foundAt.split(", ")[1]}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[130px]">
                    <span className="truncate block">{item.location}</span>
                  </td>
                  <td className="px-4 py-3">
                    <CountdownChip dateStr={item.dateFound} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal(item)} className="text-cyan-600 hover:text-cyan-700 p-1.5 rounded-lg hover:bg-cyan-50 border border-transparent hover:border-cyan-200 transition-all duration-150" title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setPendingDeleteId(item.id)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-150" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AdminTablePagination
          totalRecords={filteredItems.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={n => { setRowsPerPage(n); setCurrentPage(1); }}
        />
      </div>

      {/* ── Edit Found Item Modal ─────────────────────────────────────────── */}
      {editItem && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
            background: modalVisible ? "rgba(15,23,42,0.52)" : "rgba(15,23,42,0)",
            backdropFilter: modalVisible ? "blur(4px)" : "blur(0px)",
            transition: "background 0.25s ease, backdrop-filter 0.25s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "14px",
              boxShadow: "0 25px 60px #00000030, 0 8px 20px #0000001a",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "92vh",
              overflowY: "auto",
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? "scale(1) translateY(0)" : "scale(0.96) translateY(10px)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
            }}
          >
            {/* Modal header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: "1rem", fontWeight: 700, color: "#111827", margin: 0 }}>Edit Item Status</h2>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>Update return details for this found item</p>
              </div>
              <button
                onClick={closeModal}
                style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fee2e2"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#fecaca"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Item Name (read-only) */}
              <div>
                <label className={fLabel} style={{ fontFamily: "DM Sans, sans-serif" }}>Item Name</label>
                <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#374151", fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
                  <span style={{ fontWeight: 500, color: "#111827" }}>{editItem.name}</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={fLabel} style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Status <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className={fInput}
                  style={{ fontFamily: "DM Sans, sans-serif", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 36 }}
                >
                  <option value="Not Returned">Not Returned</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>

              {/* Returned-specific fields */}
              {editStatus === "Returned" && (
                <>
                  {/* Student Name + Roll Number */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label className={fLabel} style={{ fontFamily: "DM Sans, sans-serif" }}>Student Name <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="text"
                        value={editStudentName}
                        onChange={e => setEditStudentName(e.target.value)}
                        placeholder="Full name"
                        className={fInput}
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className={fLabel} style={{ fontFamily: "DM Sans, sans-serif" }}>Roll Number <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="text"
                        value={editRollNo}
                        onChange={e => setEditRollNo(e.target.value)}
                        placeholder="e.g. STU-2024-001"
                        className={fInput}
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                      />
                    </div>
                  </div>

                  {/* Phone + Email */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label className={fLabel} style={{ fontFamily: "DM Sans, sans-serif" }}>Phone Number <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        placeholder="e.g. +91 9876543210"
                        className={fInput}
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className={fLabel} style={{ fontFamily: "DM Sans, sans-serif" }}>Email Address <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        placeholder="student@campus.edu"
                        className={fInput}
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                      />
                    </div>
                  </div>

                  {/* Returned Date + Time */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label className={fLabel} style={{ fontFamily: "DM Sans, sans-serif" }}>Returned Date <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="date"
                        value={editReturnedDate}
                        onChange={e => setEditReturnedDate(e.target.value)}
                        className={fInput}
                        style={{ fontFamily: "DM Sans, sans-serif", colorScheme: "light" }}
                      />
                    </div>
                    <div>
                      <label className={fLabel} style={{ fontFamily: "DM Sans, sans-serif" }}>Returned Time <span style={{ color: "#ef4444" }}>*</span></label>
                      <input
                        type="time"
                        value={editReturnedTime}
                        onChange={e => setEditReturnedTime(e.target.value)}
                        className={fInput}
                        style={{ fontFamily: "DM Sans, sans-serif", colorScheme: "light" }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Remarks */}
              <div>
                <label className={fLabel} style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Remarks / Notes
                  <span style={{ color: "#9ca3af", fontWeight: 400, marginLeft: 4 }}>(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={editRemarks}
                  onChange={e => setEditRemarks(e.target.value)}
                  placeholder="Add any additional notes or remarks…"
                  className={fInput}
                  style={{ fontFamily: "DM Sans, sans-serif", resize: "none" }}
                />
              </div>

              {/* Record Information */}
              <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px" }}>
                <p style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Record Information
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {[
                    { label: "Created At", value: editItem.foundAt },
                    { label: "Updated At", value: editItem.lastUpdated },
                    { label: "Updated By", value: "Admin" },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#6b7280" }}>{row.label}</span>
                      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#111827", fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
              <button
                onClick={closeModal}
                style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "1px solid #d1d5db", background: "white", color: "#374151", fontSize: 14, fontWeight: 500, fontFamily: "DM Sans, sans-serif", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!isReturnValid}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 9, border: "none",
                  background: isReturnValid ? "#0891b2" : "#e5e7eb",
                  color: isReturnValid ? "white" : "#9ca3af",
                  fontSize: 14, fontWeight: 600, fontFamily: "DM Sans, sans-serif",
                  cursor: isReturnValid ? "pointer" : "not-allowed",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
                onMouseEnter={e => { if (isReturnValid) (e.currentTarget as HTMLButtonElement).style.background = "#0e7490"; }}
                onMouseLeave={e => { if (isReturnValid) (e.currentTarget as HTMLButtonElement).style.background = "#0891b2"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                {editStatus === "Returned" ? "Continue →" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingReturnItem && (
        <ReturnConfirmModal
          itemName={pendingReturnItem.name}
          itemId={`FOUND-${String(pendingReturnItem.id).padStart(3, "0")}`}
          itemType="Found Item"
          onConfirm={confirmReturn}
          onClose={() => setPendingReturnItem(null)}
        />
      )}

      {pendingDeleteId !== null && (() => {
        const target = items.find(i => i.id === pendingDeleteId);
        return (
          <DeleteConfirmModal
            onConfirm={confirmDelete}
            onClose={() => setPendingDeleteId(null)}
            itemName={target?.name ?? ""}
            itemId={`FOUND-${String(pendingDeleteId).padStart(3, "0")}`}
            itemType="Found Item"
          />
        );
      })()}
    </main>
  );
}

const CLAIMED_PAGE_SIZE = 10;

function GuidelinesPage() {
  const [active, setActive] = useState<"lost" | "found">("lost");

  const lostRules = [
    "Verify student ID before releasing any item to ensure proper ownership.",
    "The claimant should correctly describe the item appearance, brand/model, and any special marks or accessories.",
    "For electronic items, students may be asked to unlock the device or verify ownership.",
    "Admin should verify matching details from the Lost Item report before returning the item.",
    "If ownership is unclear, the item should remain under admin review until verification is complete.",
    "Items unclaimed after 6 months will be donated or disposed of responsibly.",
  ];

  const foundRules = [
    "Food items, damaged items, or unsafe materials should not be accepted.",
    "Every found item must be entered into the system immediately after submission.",
    "Admin must collect complete details of the found item: item name, color/brand, location found, and date & time found.",
    "Ensure storage areas are locked and secure at all times.",
  ];

  const RuleList = ({ rules, accent }: { rules: string[]; accent: "cyan" | "amber" }) => (
    <div className="space-y-3">
      {rules.map((g, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${accent === "cyan" ? "bg-cyan-100" : "bg-amber-100"}`}>
            <CheckCircle size={14} className={accent === "cyan" ? "text-cyan-600" : "text-amber-600"} />
          </span>
          <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif" }}>{g}</p>
        </div>
      ))}
    </div>
  );

  return (
    <main className="flex-1 overflow-y-auto px-5 py-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Admin Guidelines</h1>
        <p className="text-gray-600 text-sm mb-6" style={{ fontFamily: "DM Sans, sans-serif" }}>Essential protocols for managing lost and found items</p>

        {/* Toggle Switch */}
        <div className="inline-flex rounded-xl border border-gray-200 bg-white shadow-sm p-1 mb-6">
          <button
            onClick={() => setActive("lost")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              active === "lost"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <AlertCircle size={14} />
            Lost Items Rules
          </button>
          <button
            onClick={() => setActive("found")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              active === "found"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <CheckSquare size={14} />
            Found Items Rules
          </button>
        </div>

        {/* Active Panel */}
        {active === "lost" ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                <AlertCircle size={18} className="text-cyan-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>Lost Items Rules</h2>
                <p className="text-gray-500 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>Protocols for returning lost items to students</p>
              </div>
            </div>
            <RuleList rules={lostRules} accent="cyan" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <CheckSquare size={18} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "Outfit, sans-serif" }}>Found Items Rules</h2>
                <p className="text-gray-500 text-xs" style={{ fontFamily: "DM Sans, sans-serif" }}>Protocols for accepting and storing found items</p>
              </div>
            </div>
            <RuleList rules={foundRules} accent="amber" />
          </div>
        )}
      </div>
    </main>
  );
}

function SettingsPage({ onLogoutRequest }: { onLogoutRequest: () => void }) {
  return (
    <main className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>Settings</h1>
        <p className="text-gray-600 text-sm mb-6" style={{ fontFamily: "DM Sans, sans-serif" }}>Manage your account and preferences</p>

        <div className="space-y-4">
          {/* Account Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Account</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900" style={{ fontFamily: "DM Sans, sans-serif" }}>Email</p>
                  <p className="text-xs text-gray-500">admin@campus.edu</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900" style={{ fontFamily: "DM Sans, sans-serif" }}>Role</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Session</h2>
            <button
              onClick={onLogoutRequest}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 font-medium text-sm transition-all duration-150 w-full justify-center border border-red-200"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function AdminView({ onLogout }: { onLogout: () => void }) {
  const [activeNav, setActiveNav] = useState("lost-items");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Shared item state lifted here so pages can communicate
  const [sharedFoundItems, setSharedFoundItems] = useState(adminFoundItems);
  const [sharedLostItems, setSharedLostItems] = useState(adminLostItems);
  const [disposedHistory, setDisposedHistory] = useState<DisposedRecord[]>([]);
  const [returnedLostHistory, setReturnedLostHistory] = useState<ReturnedLostRecord[]>([]);

  const handleDispose = (record: DisposedRecord) => {
    setDisposedHistory(prev => [record, ...prev]);
  };

  const handleReturn = (record: ReturnedLostRecord) => {
    setReturnedLostHistory(prev => [record, ...prev]);
  };

  const handleNavChange = (page: string) => {
    setActiveNav(page);
  };

  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);
  const confirmLogout = () => { setShowLogoutModal(false); onLogout(); };

  const renderMain = () => {
    if (activeNav === "upload-item") {
      return <UploadPage onBack={() => setActiveNav("lost-items")} />;
    }
    if (activeNav === "lost-items") {
      return <LostItemsPage items={sharedLostItems} setItems={setSharedLostItems} onReturn={handleReturn} />;
    }
    if (activeNav === "found-items") {
      return <FoundItemsPage items={sharedFoundItems} setItems={setSharedFoundItems} onReturn={handleReturn} />;
    }
    if (activeNav === "expired-items") {
      return (
        <ExpiredItemsPage
          foundItems={sharedFoundItems}
          lostItems={sharedLostItems}
          setFoundItems={setSharedFoundItems}
          setLostItems={setSharedLostItems}
          onDispose={handleDispose}
        />
      );
    }
    if (activeNav === "history") {
      return <ItemHistoryPage foundItems={sharedFoundItems} lostItems={sharedLostItems} disposedHistory={disposedHistory} returnedLostHistory={returnedLostHistory} />;
    }
    if (activeNav === "guidelines") {
      return <GuidelinesPage />;
    }
    if (activeNav === "settings") {
      return <SettingsPage onLogoutRequest={openLogoutModal} />;
    }
    return <LostItemsPage items={sharedLostItems} setItems={setSharedLostItems} onReturn={handleReturn} />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar active={activeNav} setActive={handleNavChange} onLogoutRequest={openLogoutModal} />
      <div className="flex-1 flex flex-col min-w-0">
        {renderMain()}
      </div>
      {showLogoutModal && (
        <LogoutModal onConfirm={confirmLogout} onClose={closeLogoutModal} />
      )}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<"landing" | "login" | "browse-lost" | "browse-found" | "admin">("landing");

  const handleBrowseLost = () => {
    setView("browse-lost");
  };

  const handleBrowseFound = () => {
    setView("browse-found");
  };

  const handleAdminLogin = () => {
    setView("login");
  };

  const handleLogin = (mode: "student" | "admin") => {
    if (mode === "admin") {
      setView("admin");
    }
  };

  const handleBackToLanding = () => {
    setView("landing");
  };

  if (view === "landing") {
    return <LandingPage onBrowseLost={handleBrowseLost} onBrowseFound={handleBrowseFound} onAdminLogin={handleAdminLogin} />;
  }

  if (view === "login") {
    return <LoginPage onLogin={handleLogin} onBack={handleBackToLanding} />;
  }

  if (view === "browse-lost" || view === "browse-found") {
    return <PublicBrowseView type={view === "browse-lost" ? "lost" : "found"} onBack={handleBackToLanding} />;
  }

  return <AdminView onLogout={handleBackToLanding} />;
}
