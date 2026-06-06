/**
 * GroupLabel — date-group separator pill row.
 *
 * Props:
 *   children  React node — label text inside the pill
 *   spaced    boolean    — when true adds the "spaced" modifier class for
 *                          extra top margin (used for all groups after the first)
 *   icon      React node — optional icon rendered before the text (e.g. <Clock>)
 */
export default function GroupLabel({ children, spaced = false, icon }) {
  return (
    <div className={spaced ? "group-label spaced" : "group-label"}>
      <div className="group-pill">
        {icon}
        {children}
      </div>
    </div>
  );
}
