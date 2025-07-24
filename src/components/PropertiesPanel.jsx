// src/components/PropertiesPanel.jsx
import React from 'react';
import { useMartStore } from '../store/useMartStore';

const commonInputProps = (propName, itemType, itemId, value, handler, blurHandler, isNumeric = false, isFloat = false, inputType = "text", step, min) => ({
    id: `${itemType}-${itemId}-${propName}`,
    type: inputType,
    className: inputType === 'color' ? "color-input" : "width-input",
    value: (isNumeric && typeof value === 'number') ? (isFloat ? value.toFixed(1) : value) : (value || (isNumeric ? "0" : "")),
    onChange: (e) => handler(itemId, propName, e.target.value, itemType, isNumeric, isFloat),
    onBlur: () => blurHandler(`${itemType}-${propName}`),
    ...(step && { step }),
    ...(min !== undefined && { min }),
});


const PropertiesPanel = () => {
  const { 
    floors, activeFloorId, updateItemProperty, _saveStateToHistory,
    selectedComponentId, selectedShapeId, updateSideLabel,
  } = useMartStore(state => state);

  const currentFloor = floors.find(f => f.id === activeFloorId);
  const selectedComponent = currentFloor?.components.find(c => c.id === selectedComponentId);
  const selectedShape = currentFloor?.shapes.find(s => s.id === selectedShapeId);

  const handlePropChange = (id, property, value, itemType, isNumeric = false, isFloat = false) => {
    let finalValue = value;
    if (isNumeric) {
        finalValue = isFloat ? parseFloat(value) : parseInt(value);
        if (isNaN(finalValue)) finalValue = property.toLowerCase().includes('scale') ? 1 : (property === 'strokeWidth' ? 0.1 : 0);
    }
    updateItemProperty(id, property, finalValue, itemType);
  };
  const handlePropBlur = (context) => _saveStateToHistory(`blur-${context}`);

  const renderSideLabelInputs = (item, itemType) => {
    if (!item || !item.sideLabels) return null;
    const labelNames = itemType === 'shape' ? 
        item.points.map((_,i) => `Side ${i+1}`) : 
        ["Top", "Right", "Bottom", "Left"];

    return (
        <>
            <div className={itemType === 'shape' ? "component-properties-divider" : ""}></div>
            <label className="property-label">{itemType === 'shape' ? 'Shape' : 'Component'} Side Labels:</label>
            <div id={itemType === 'shape' ? "side-labels-list" : "component-side-labels-list"}>
                {item.sideLabels.map((label, i) => (
                    (itemType === 'component' || i < labelNames.length) && // Ensure index is valid for shape sides
                    <div className="side-label-item" key={`${itemType}-${item.id}-label-${i}`}>
                        <span>{labelNames[i]}:</span>
                        <input 
                            className={itemType === 'shape' ? "side-label-input" : "component-side-label-input"}
                            value={label || ""}
                            placeholder="Label (optional)"
                            onChange={(e) => updateSideLabel(item.id, i, e.target.value.trim(), itemType)}
                            onBlur={() => _saveStateToHistory(`updateSideLabel-${itemType}-${i}`)}
                        />
                    </div>
                ))}
            </div>
        </>
    );
  };

  return (
    <div id="properties">
      <p>Properties</p>
      {(!selectedComponent && !selectedShape && currentFloor) && (
        <div className="floor-properties">
          <label className="property-label" htmlFor={`floor-${currentFloor.id}-name`}>Floor Name:</label>
          <input {...commonInputProps('name', 'floor', currentFloor.id, currentFloor.name, handlePropChange, handlePropBlur)} />
          {/* TODO: Copy Floor Shape To Select */}
        </div>
      )}

      {selectedShape && (
         <div className="shape-properties"> {/* Original had this class */}
            <label className="property-label" htmlFor={`shape-${selectedShape.id}-fillColor`}>Shape Fill Color:</label>
            <input {...commonInputProps('fillColor', 'shape', selectedShape.id, selectedShape.fillColor, handlePropChange, handlePropBlur, false, false, "color")} />
            
            <label className="property-label" htmlFor={`shape-${selectedShape.id}-strokeColor`}>Walls Color:</label>
            <input {...commonInputProps('strokeColor', 'shape', selectedShape.id, selectedShape.strokeColor, handlePropChange, handlePropBlur, false, false, "color")} />
            
            <label className="property-label" htmlFor={`shape-${selectedShape.id}-strokeWidth`}>Wall Width:</label>
            <input {...commonInputProps('strokeWidth', 'shape', selectedShape.id, selectedShape.strokeWidth, handlePropChange, handlePropBlur, true, true, "number", "0.1", "0.1")} />
            
            {selectedShape.closed && renderSideLabelInputs(selectedShape, 'shape')}
         </div>
      )}
      
      {selectedComponent && (
        <div id="component-properties"> {/* Original had this ID */}
          <label className="property-label" htmlFor={`component-${selectedComponent.id}-name`}>Name:</label>
          <input {...commonInputProps('name', 'component', selectedComponent.id, selectedComponent.name, handlePropChange, handlePropBlur)} />

          {['x', 'y'].map(axis => (
            <React.Fragment key={axis}>
              <label className="property-label" htmlFor={`component-${selectedComponent.id}-${axis}`}>{`Position ${axis.toUpperCase()}:`}</label>
              <input {...commonInputProps(axis, 'component', selectedComponent.id, selectedComponent[axis], handlePropChange, handlePropBlur, true, true, "number", "0.1")} />
            </React.Fragment>
          ))}
          <label className="property-label" htmlFor={`component-${selectedComponent.id}-rotation`}>Rotation (°):</label>
          <input {...commonInputProps('rotation', 'component', selectedComponent.id, selectedComponent.rotation, handlePropChange, handlePropBlur, true, true, "number", "1")} />

          <label className="property-label" htmlFor={`component-${selectedComponent.id}-borderRadius`}>Border Radius:</label>
          <input {...commonInputProps('borderRadius', 'component', selectedComponent.id, selectedComponent.borderRadius, handlePropChange, handlePropBlur, true, false, "number", "1", "0")} />
          
          <label className="property-label" htmlFor={`component-${selectedComponent.id}-scaleX`}>Scale X:</label>
          <input {...commonInputProps('scaleX', 'component', selectedComponent.id, selectedComponent.scaleX, handlePropChange, handlePropBlur, true, true, "number", "0.1", "0.1")} />

          <label className="property-label" htmlFor={`component-${selectedComponent.id}-scaleY`}>Scale Y:</label>
          <input {...commonInputProps('scaleY', 'component', selectedComponent.id, selectedComponent.scaleY, handlePropChange, handlePropBlur, true, true, "number", "0.1", "0.1")} />
          
          <label className="property-label" htmlFor={`component-${selectedComponent.id}-fillColor`}>Fill Color:</label>
          <input {...commonInputProps('fillColor', 'component', selectedComponent.id, selectedComponent.fillColor, handlePropChange, handlePropBlur, false, false, "color")} />

          <label className="property-label" htmlFor={`component-${selectedComponent.id}-strokeColor`}>Stroke Color:</label>
          <input {...commonInputProps('strokeColor', 'component', selectedComponent.id, selectedComponent.strokeColor, handlePropChange, handlePropBlur, false, false, "color")} />

          <label className="property-label" htmlFor={`component-${selectedComponent.id}-strokeWidth`}>Stroke Width:</label>
          <input {...commonInputProps('strokeWidth', 'component', selectedComponent.id, selectedComponent.strokeWidth, handlePropChange, handlePropBlur, true, true, "number", "0.1", "0")} />
          
          {renderSideLabelInputs(selectedComponent, 'component')}
        </div>
      )}
    </div>
  );
};
export default PropertiesPanel;