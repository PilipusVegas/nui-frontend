import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGasPump, faUtensils, faHotel, faBriefcase, faCheckCircle, faCircle,} from "@fortawesome/free-solid-svg-icons";

const TunjanganDetail = ({ data }) => {
    if (!data) return null;

    const Row = ({ icon, label, active, activeColor }) => (
        <div className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={icon} className={`text-lg ${active ? activeColor : "text-gray-300"}`}/>
                <span className="text-sm text-gray-700">
                    {label}
                </span>
            </div>

            <div className={`flex items-center gap-2 text-sm font-medium ${active ? "text-green-600" : "text-gray-400"}`}>
                <FontAwesomeIcon icon={active ? faCheckCircle : faCircle} className={active ? "text-green-500" : "text-gray-300"}/>
                {active ? "Aktif" : "Tidak Aktif"}
            </div>
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <p className="text-lg font-semibold text-gray-900">
                    {data.nama}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>
                        <span className="font-medium text-gray-700">NIP:</span>{" "}
                        {data.nip}
                    </span>

                    <span>
                        <span className="font-medium text-gray-700">Role:</span>{" "}
                        {data.role}
                    </span>
                </div>

                <div className="mt-1 text-sm text-gray-500">
                    {data.perusahaan}
                </div>
            </div>

            {/* SECTION TUNJANGAN */}
            <div className="border rounded-xl px-4">
                <Row
                    icon={faGasPump}
                    label="Uang Bensin"
                    active={data.bensin}
                    activeColor="text-orange-500"
                />
                <Row
                    icon={faUtensils}
                    label="Voucher Makan"
                    active={data.makan}
                    activeColor="text-green-500"
                />
                <Row
                    icon={faHotel}
                    label="Biaya Penginapan"
                    active={data.penginapan}
                    activeColor="text-indigo-500"
                />
                <Row
                    icon={faBriefcase}
                    label="Perjalanan Dinas"
                    active={data.dinas}
                    activeColor="text-blue-500"
                />
            </div>
        </div>
    );
};

export default TunjanganDetail;
