export function Field({name, value, onChange, children = null}) {

    return (
        <div className="d-flex gap-4 mt-4">
            <label htmlFor={name} className="col-form-label mr-4">{children}</label>
            <div className="w-100">
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="form-control"
                />
            </div>
        </div>
    );
}
