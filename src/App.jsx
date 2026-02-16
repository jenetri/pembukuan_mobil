import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./login";
import FormTransaksi from "./components/FormTransaksi";
import TableTransaksi from "./components/TableTransaksi";

function App() {
  const [session, setSession] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [role, setRole] = useState(null);
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

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

  // ================= FETCH ROLE & COMPANY =================
  useEffect(() => {
    if (session) {
      fetchRole();
      fetchCompany();
    }
  }, [session]);

  const fetchRole = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!error && data) {
      setRole(data.role);
    }
  };

  const fetchCompany = async () => {
    const { data, error } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", session.user.id)
      .single();

    if (!error && data) {
      setCompanyId(data.company_id);
    }
  };

  // ================= LOAD DATA =================
  useEffect(() => {
    if (session && (companyId || role === "super_admin")) {
      loadData();
    }
  }, [companyId, role]);

  const loadData = async () => {
    let query = supabase
      .from("transaksi")
      .select("*")
      .order("id", { ascending: false });

    // Non super admin hanya lihat company sendiri
    if (role !== "super_admin") {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query;

    if (!error) {
      setData(data || []);
    } else {
      console.log(error);
    }
  };

  // ================= CRUD =================
  const simpanData = async () => {
    if (!companyId) {
      alert("Company ID tidak ditemukan");
      return;
    }

    const { error } = await supabase
      .from("transaksi")
      .insert([
        {
          tanggal: form.tanggal,
          nopol: form.nopol,
          hargaBeli: Number(form.hargaBeli),
          biaya: Number(form.biaya || 0),
          hargaJual: Number(form.hargaJual),
          user_id: session.user.id,
          company_id: companyId,
        },
      ]);

    if (error) {
      console.log(error);
      alert(error.message);
    } else {
      resetForm();
      loadData();
    }
  };

  const updateData = async () => {
    const { error } = await supabase
      .from("transaksi")
      .update({
        tanggal: form.tanggal,
        nopol: form.nopol,
        hargaBeli: Number(form.hargaBeli),
        biaya: Number(form.biaya || 0),
        hargaJual: Number(form.hargaJual),
      })
      .eq("id", editId);

    if (error) {
      alert(error.message);
    } else {
      setEditId(null);
      resetForm();
      loadData();
    }
  };

  const hapusData = async (id) => {
    const { error } = await supabase
      .from("transaksi")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      loadData();
    }
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

  // ================= UI =================
  if (!session) return <Login setSession={setSession} />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Pembukuan Mobil SaaS
          </h1>

          <div>
            <span className="mr-4 font-semibold">
              Role: {role}
            </span>

            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* FORM */}
        <FormTransaksi
          form={form}
          setForm={setForm}
          editId={editId}
          simpanData={simpanData}
          updateData={updateData}
        />

        {/* TABLE */}
        <TableTransaksi
          data={data}
          setEditId={setEditId}
          setForm={setForm}
          hapusData={hapusData}
        />

      </div>
    </div>
  );
}

export default App;