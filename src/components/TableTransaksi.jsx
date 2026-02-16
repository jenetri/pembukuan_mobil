export default function TableTransaksi({
  data,
  setEditId,
  setForm,
  hapusData
}) {

  const rupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka || 0);

  return (
    <div className="bg-white rounded shadow overflow-auto">
      <table className="w-full text-sm">

        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-left">Tanggal</th>
            <th className="text-left">No Polisi</th>
            <th className="text-right">Harga Beli</th>
            <th className="text-right">Biaya</th>
            <th className="text-right">Harga Jual</th>
            <th className="text-right">Keuntungan</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500">
                Belum ada transaksi
              </td>
            </tr>
          ) : (
            data.map((item) => {
              const untung =
                Number(item.hargaJual || 0) -
                Number(item.hargaBeli || 0) -
                Number(item.biaya || 0);

              return (
                <tr key={item.id} className="border-t hover:bg-gray-50">

                  <td className="p-2">{item.tanggal}</td>
                  <td>{item.nopol}</td>
                  <td className="text-right">
                    {rupiah(item.hargaBeli)}
                  </td>
                  <td className="text-right">
                    {rupiah(item.biaya)}
                  </td>
                  <td className="text-right">
                    {rupiah(item.hargaJual)}
                  </td>
                  <td
                    className={`text-right font-bold ${
                      untung >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {rupiah(untung)}
                  </td>

                  <td className="text-center">
                    <button
                      onClick={() => {
                        setEditId(item.id);
                        setForm(item);
                      }}
                      className="text-blue-600 mr-3 hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => hapusData(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>

                </tr>
              );
            })
          )}
        </tbody>

      </table>
    </div>
  );
}