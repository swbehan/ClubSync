export default function InnerDuesCard({ componentInfo }) {
  const { header, subheader, context } = componentInfo;
  return (
    <>
      <div className="inner-card-header">{header}</div>
      <div className="inner-card-subheader">{subheader}</div>
      <div className="inner-card-context">{context}</div>
    </>
  );
}
