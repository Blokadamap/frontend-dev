export const Input = ({ icon, ...props }) => {
  return (
    <div className="ui-input-wrapper">
      {icon && <span>{icon}</span>}
      <input className="ui-input-field" {...props} />
    </div>
  );
};