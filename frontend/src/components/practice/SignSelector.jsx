import "./SignSelector.css";

const signs = [
  {
    id: "hello",
    name: "Hello",
    category: "Greetings",
   
  },
  
  {
    id: "yes",
    name: "Yes",
    category: "Daily Communication",
    
  },
  {
    id: "no",
    name: "No",
    category: "Daily Communication",
   
  },
  {
    id: "one",
    name: "One",
    category: "Numbers",
   
  },
  {
    id: "two",
    name: "Two",
    category: "Numbers",
   
  },
  {
    id: "three",
    name: "Three",
    category: "Numbers",
   
  },
  {
    id: "four",
    name: "Four",
    category: "Numbers",
   
  },
  {
    id: "five",
    name: "Five",
    category: "Numbers",
   
  },
];

function SignSelector({
  selectedSign,
  onSelectSign,
}) {
  return (
    <div className="sign-selector">
      <div className="sign-selector-header">
        <div>
          <span className="sign-selector-eyebrow">
            PRACTICE TARGET
          </span>

          <h2>Choose a sign to practice</h2>

          <p>
            Select a sign and then perform it in front
            of the camera.
          </p>
        </div>
      </div>

      <div className="sign-selector-grid">
        {signs.map((sign) => {
          const isSelected =
            selectedSign?.id === sign.id;

          return (
            <button
              key={sign.id}
              type="button"
              className={`sign-option ${
                isSelected
                  ? "sign-option-selected"
                  : ""
              }`}
              onClick={() => onSelectSign(sign)}
            >
              <span className="sign-option-icon material-symbols-rounded">
                sign_language
              </span>

              <span className="sign-option-content">
                <strong>{sign.name}</strong>
                <small>{sign.category}</small>
              </span>

              {isSelected && (
                <span className="material-symbols-rounded sign-option-check">
                  check_circle
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedSign && (
        <div className="selected-sign-info">
          <span className="material-symbols-rounded">
            flag
          </span>

          <div>
            <span>Current practice target</span>
            <strong>{selectedSign.name}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignSelector;