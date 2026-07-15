import PropTypes from "prop-types";

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

InnerDuesCard.propTypes = {
  componentInfo: PropTypes.shape({
    header: PropTypes.string,
    subheader: PropTypes.string,
    context: PropTypes.string,
  }).isRequired,
};
