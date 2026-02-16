import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./login";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function App() {
  const [session, setSession] = useState(null);
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [role, setRole] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");

  const [form, setForm] = useState({
    tanggal: "",
    nopol: "",
    hargaBeli: "",
    biaya: "",
    hargaJual: "",
  });

  // ================= AUTH =================
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ================= LOAD DATA & ROLE =================
  useEffect(() => {
    if (session) {
      loadData();
      fetchRole();
    }
  }, [session]);

  const fetchRole = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (data) setRole(data.role);
  };

  const loadData = async () => {
    let query = supabase.from("transaksi").select("*").order("id", { ascending: false });

    if (role !== "admin") {
      query = query.eq("user_id", session.user.id);
    }

    const { data } = await query;
    setData(data || []);
  };

  // ================= CRUD =================
  const simpanData = async () => {
    await supabase.from("transaksi").insert([
      { ...form, user_id: session.user.id },
    ]);
    resetForm();
    loadData();
  };

  const updateData = async () => {
    await supabase.from("transaksi").update(form).eq("id", editId);
    setEditId(null);
    resetForm();
    loadData();
  };

  const hapusData = async (id) => {
    await supabase.from("transaksi").delete().eq("id", id);
    loadData();
  };

  const resetForm = () => {
    setForm({
      tanggal: "",
      nopol: "",
      hargaBeli: "",
      biaya: "",
      hargaJual: "",
    });
  };

  const rupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka || 0);

  const totalKeuntungan = data.reduce((total, item) => {
    return (
      total +
      (Number(item.hargaJual || 0) -
        Number(item.hargaBeli || 0) -
        Number(item.biaya || 0))
    );
  }, 0);

  const rataRataUntung =
    data.length > 0 ? totalKeuntungan / data.length : 0;

  const filteredData = data.filter((item) => {
    const cocokSearch = item.nopol
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const cocokBulan = filterBulan
      ? item.tanggal?.startsWith(filterBulan)
      : true;

    return cocokSearch && cocokBulan;
  });

  // ================= EXPORT EXCEL =================
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "Laporan.xlsx");
  };

  // ================= EXPORT PDF =================
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Pembukuan Mobil PRO 2.0", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Tanggal","NoPol","Beli","Biaya","Jual","Untung"]],
      body: filteredData.map(item => [
        item.tanggal,
        item.nopol,
        item.hargaBeli,
        item.biaya,
        item.hargaJual,
        Number(item.hargaJual||0) -
        Number(item.hargaBeli||0) -
        Number(item.biaya||0)
      ])
    });

    doc.save("Laporan.pdf");
  };

  if (!session) return <Login setSession={setSession} />;

  return (
    <div className={darkMode ? "bg-gray-900 text-white min-h-screen p-6" : "bg-gray-100 min-h-screen p-6"}>
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Pembukuan Mobil PRO 2.0</h1>
            <p className="text-sm">Role: {role}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={()=>setDarkMode(!darkMode)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg">
              Dark Mode
            </button>

            <button onClick={exportExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg">
              Excel
            </button>

            <button onClick={exportPDF}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg">
              PDF
            </button>

            <button onClick={()=>supabase.auth.signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg">
              Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <p>Total Transaksi</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Total Keuntungan</p>
            <p className="text-2xl font-bold text-green-600">
              {rupiah(totalKeuntungan)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p>Rata-rata Profit</p>
            <p className="text-2xl font-bold text-blue-600">
              {rupiah(rataRataUntung)}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;