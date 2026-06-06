import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { useToast } from "../../../context/ToastContext";
import { MEMBERS } from "../../../components/application/v2/members/data";
import { GROUP, STATS, PROGRESS, RECIPIENT, GILIRAN } from "../../../components/application/v2/grup/data";
import GroupHeader from "../../../components/application/v2/grup/GroupHeader";
import GroupHero from "../../../components/application/v2/grup/GroupHero";
import ProgressIuran from "../../../components/application/v2/grup/ProgressIuran";
import RecipientCard from "../../../components/application/v2/grup/RecipientCard";
import GiliranTimeline from "../../../components/application/v2/grup/GiliranTimeline";
import MemberStatusList from "../../../components/application/v2/grup/MemberStatusList";
import PayButton from "../../../components/application/v2/grup/PayButton";
import PayFooter from "../../../components/application/v2/grup/PayFooter";

export default function GroupDetail() {
  const navigate = useNavigate();
  const toast = useToast();

  const viewMembers = () => navigate("/app/anggota");
  const pay = () => toast(`Memproses pembayaran ${GROUP.payAmount}…`);

  return (
    <div className="v2-screen">
      <div className="v2-inner overflow-y-auto">

        <GroupHeader title={GROUP.name} sub={GROUP.headerSub} onBack={() => navigate(-1)} />

        {/* Mobile: single stacked column. Desktop (lg): two columns filling a wide
            centered container — summary on the left, member list on the right. */}
        <div className="mx-auto grid w-full max-w-140 flex-1 grid-cols-1 gap-4 px-5 pb-5
                        lg:max-w-300 lg:grid-cols-2 lg:items-start lg:gap-7 lg:px-8 lg:py-6">

          {/* Left column — summary + (desktop-only) pay action */}
          <div className="flex flex-col gap-4 lg:gap-5">
            <GroupHero group={GROUP} stats={STATS} />
            <ProgressIuran progress={PROGRESS} />
            <RecipientCard recipient={RECIPIENT} onClick={viewMembers} />
            <GiliranTimeline items={GILIRAN} />
            <div className="hidden lg:block">
              <PayButton label={GROUP.payLabel} onPay={pay} />
            </div>
          </div>

          {/* Right column — members & status */}
          <div className="flex flex-col gap-4">
            <MemberStatusList members={MEMBERS} count={GROUP.memberCount} onViewAll={viewMembers} />
          </div>

        </div>

        {/* Mobile sticky pay bar (hidden on desktop via lg:hidden inside PayFooter) */}
        <PayFooter label={GROUP.payLabel} onPay={pay} />

      </div>
    </div>
  );
}
