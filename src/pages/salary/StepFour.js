import React from 'react';
import PropTypes from 'prop-types';

const StepFour = ({ formData, handleNextStepData }) => {
  const {
    nama = 'Tidak ada data', 
    jabatan = 'Tidak ada data', 
    status = 'Tidak ada data', 
    bulan = 'Tidak ada data', 
    tahun = 'Tidak ada data', 
    keterangan = 'Tidak ada data', 
    gajiPokok = 'Tidak ada data', 
    tunjanganTransport = 'Tidak ada data', 
    tunjanganJabatan = 'Tidak ada data', 
    tunjanganKehadiran = 'Tidak ada data', 
    upahLemburan = 'Tidak ada data', 
    upahUangMakanLembur = 'Tidak ada data', 
    tunjanganPosisiProyek = 'Tidak ada data', 
    kinerjaPerformance = 'Tidak ada data', 
    totalPenghasilan = 0, 
    bpjsKesehatan = 'Tidak ada data', 
    jaminanHariTua = 'Tidak ada data', 
    keterlambatan = 'Tidak ada data', 
    totalPotongan = 0
  } = formData;
  const totalDidapat = (totalPenghasilan - totalPotongan).toString();

  const formatToRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      totalDidapat: totalDidapat.toString(),
      totalPenghasilan: totalPenghasilan.toString(),
      totalPotongan: totalPotongan.toString(),
    };
    console.log("Data:", updatedFormData);
    handleNextStepData(updatedFormData);
  };

  const partOne = [
    { label: 'Bulan dan Tahun', value: `${bulan} ${tahun}` },
    { label: 'Nama', value: nama },
    { label: 'Jabatan', value: jabatan },
    { label: 'Status', value: status },
    { label: 'Keterangan', value: keterangan },
  ];

  const partTwo = [
    { label: 'Gaji Pokok', value: formatToRupiah(gajiPokok) },
    { label: 'Tunjangan Transport', value: formatToRupiah(tunjanganTransport) },
    { label: 'Tunjangan Jabatan', value: formatToRupiah(tunjanganJabatan) },
    { label: 'Tunjangan Kehadiran', value: formatToRupiah(tunjanganKehadiran) },
    { label: 'Upah Lemburan', value: formatToRupiah(upahLemburan) },
    { label: 'Upah Uang Makan Lembur', value: formatToRupiah(upahUangMakanLembur) },
    { label: 'Tunjangan Posisi Proyek', value: formatToRupiah(tunjanganPosisiProyek) },
    { label: 'Kinerja Performance', value: formatToRupiah(kinerjaPerformance) },
    { label: 'Total Penghasilan', value: formatToRupiah(totalPenghasilan) },
  ];

  const partThree = [
    { label: 'BPJS Kesehatan', value: formatToRupiah(bpjsKesehatan) },
    { label: 'Jaminan Hari Tua', value: formatToRupiah(jaminanHariTua) },
    { label: 'Keterlambatan', value: formatToRupiah(keterlambatan) },
    { label: 'Total Potongan', value: formatToRupiah(totalPotongan) },
  ];

  const partFour = [
    { label: 'Penerimaan Bersih', value: formatToRupiah(totalDidapat) },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <form onSubmit={handleSubmit}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Informasi</h3>
            {partOne.map(({ label, value }) => (
              <div key={label} style={styles.summaryItem}>
                <div style={styles.label}>{label}:</div>
                <div style={styles.value}>{value}</div>
              </div>
            ))}
          </div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Detail Penghasilan</h3>
            {partTwo.map(({ label, value }) => (
              <div key={label} style={styles.summaryItem}>
                <div style={styles.label}>{label}:</div>
                <div style={styles.value}>{value}</div>
              </div>
            ))}
          </div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Detail Potongan</h3>
            {partThree.map(({ label, value }) => (
              <div key={label} style={styles.summaryItem}>
                <div style={styles.label}>{label}:</div>
                <div style={styles.value}>{value}</div>
              </div>
            ))}
          </div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Total</h3>
            {partFour.map(({ label, value }) => (
              <div key={label} style={styles.summaryItem}>
                <div style={styles.label}>{label}:</div>
                <div style={styles.value}>{value}</div>
              </div>
            ))}
          </div>
          <div style={styles.formGroup}>
            <button type="submit" style={styles.button} aria-label="Confirm submission">OK</button>
          </div>
        </form>
      </div>
    </div>
  );
};

StepFour.propTypes = {
  formData: PropTypes.shape({
    nama: PropTypes.string,
    jabatan: PropTypes.string,
    status: PropTypes.string,
    bulan: PropTypes.string,
    tahun: PropTypes.string,
    totalPenghasilan: PropTypes.string,
    totalPotongan: PropTypes.string,
  }).isRequired,
  handleNextStepData: PropTypes.func.isRequired,
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    padding: '20px',
    maxWidth: '600px',
    border: '2px solid',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
  },
  section: {
    marginBottom: '20px',
    paddingBottom: '10px',
  },
  sectionTitle: {
    color: '#26413c',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  summaryItem: {
    display: 'flex',
    padding: '10px',
    borderBottom: '1px solid #ddd',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  value: {
    fontSize: '1rem',
    maxWidth: '350px',
    wordWrap: 'break-word',
  },
  formGroup: {
    marginTop: '20px',
  },
  button: {
    width: '100%',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    backgroundColor: '#28a745',
    border: '2px solid #1C1C1C',
  },
};

export default StepFour;
