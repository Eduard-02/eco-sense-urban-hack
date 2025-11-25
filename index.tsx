
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

/* --- TYPES --- */
type GroceryItem = {
  name: string;
  qty: string;
  co2: number;
  color: string;
  icon: string;
};

type TabId = 'import' | 'groceries' | 'house' | 'transport' | 'receipt';

/* --- DATA & CONFIG --- */
const IMPORTED_ITEMS: GroceryItem[] = [
  { name: 'Milk', qty: '1 kg', co2: 1.00, color: '#f8fafc', icon: '🥛' },
  { name: 'Yogurt', qty: '0.5 kg', co2: 0.52, color: '#e2e8f0', icon: '🥣' },
  { name: 'Dark Rye Bread', qty: '0.2 kg', co2: 0.41, color: '#78350f', icon: '🍞' },
  { name: 'Potatoes', qty: '1 kg', co2: 0.01, color: '#facc15', icon: '🥔' },
  { name: 'Oatmeal', qty: '0.3 kg', co2: 0.62, color: '#fbbf24', icon: '🥣' },
  { name: 'Carrots', qty: '0.5 kg', co2: 0.01, color: '#fb923c', icon: '🥕' },
  { name: 'Onions', qty: '0.2 kg', co2: 0.05, color: '#fca5a5', icon: '🧅' },
  { name: 'Peas & Beans', qty: '0.5 kg', co2: 0.51, color: '#22c55e', icon: '🫛' },
  { name: 'Frozen Berries', qty: '0.2 kg', co2: 0.21, color: '#818cf8', icon: '🫐' },
  { name: 'Coffee', qty: '0.5 kg', co2: 2.53, color: '#3f2c22', icon: '☕' },
  { name: 'Eggs', qty: '0.4 kg', co2: 0.83, color: '#fef08a', icon: '🥚' }
];

const CONFIG = {
  HOUSE_DEMAND: {
    apartment_modern: 80,
    apartment_old: 130,
    detached_modern: 110,
    detached_old: 170
  } as Record<string, number>,
  HEATING: {
    district: 0.16,
    oil: 0.32,
    gas: 0.23,
    heat_pump: 0.05
  } as Record<string, number>,
  TRANSPORT: {
    car: 0.18,
    bus: 0.09,
    train: 0.04,
    bike: 0
  } as Record<string, number>
};

/* --- UTILS --- */
const findSmartUnit = (targetCo2: number) => {
  // If no target, default to Milk
  if (targetCo2 <= 0) return { item: IMPORTED_ITEMS[0], count: 0 };

  let bestItem = IMPORTED_ITEMS[0];
  let bestScore = Number.MAX_VALUE;

  for (const item of IMPORTED_ITEMS) {
    if (item.co2 <= 0) continue;

    const count = targetCo2 / item.co2;
    const rounded = Math.round(count);
    
    // We prefer counts close to integers
    const deviation = Math.abs(count - rounded);
    
    // We prefer counts that are not too huge (e.g. 1-20 is good, 500 is bad)
    // and not zero.
    if (rounded === 0) continue;

    // Score calculation (lower is better)
    // Weighted deviation + penalty for extreme numbers
    let score = deviation * 10;
    
    // Add penalty if count is very large (> 20)
    if (rounded > 20) score += 2;
    // Add penalty if count is very small (< 1)
    if (rounded < 1) score += 5;

    // Favor exact matches (deviation near 0) highly
    if (deviation < 0.05) score -= 5;

    if (score < bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return { 
    item: bestItem, 
    count: Math.max(1, Math.round(targetCo2 / bestItem.co2)) 
  };
};

/* --- COMPONENTS --- */

const App = () => {
  const [activeTab, setActiveTab] = useState<TabId>('import');
  const [isImported, setIsImported] = useState(false);

  // House State
  const [houseArea, setHouseArea] = useState<number | ''>(80);
  const [houseType, setHouseType] = useState('apartment_modern');
  const [heatingType, setHeatingType] = useState('district');

  // Transport State
  const [tripDist, setTripDist] = useState<number | ''>(15);
  const [tripMode, setTripMode] = useState('car');
  const [tripFreq, setTripFreq] = useState(5);

  const handleTabSwitch = (tab: TabId) => {
    if (!isImported && tab !== 'import') return;
    setActiveTab(tab);
  };

  // Derived Values
  const houseCo2 = useMemo(() => {
    const area = houseArea === '' ? 0 : houseArea;
    const annualKwh = area * CONFIG.HOUSE_DEMAND[houseType];
    const annualKg = annualKwh * CONFIG.HEATING[heatingType];
    return annualKg / 365;
  }, [houseArea, houseType, heatingType]);

  const tripCo2 = useMemo(() => {
    const dist = tripDist === '' ? 0 : tripDist;
    return dist * CONFIG.TRANSPORT[tripMode];
  }, [tripDist, tripMode]);

  const dailyTransportCo2 = useMemo(() => {
    // 2 trips per day * freq days a week / 7 days
    return (tripCo2 * 2 * tripFreq) / 7;
  }, [tripCo2, tripFreq]);

  const groceryTotalCo2 = useMemo(() => {
    return IMPORTED_ITEMS.reduce((sum, item) => sum + item.co2, 0);
  }, []);

  const dailyGroceryCo2 = groceryTotalCo2 / 7;
  const totalDailyCo2 = houseCo2 + dailyTransportCo2 + dailyGroceryCo2;

  return (
    <div className="app-container">
      <header>
        <h1>EcoSense</h1>
        <p className="subtitle">
          Your daily carbon receipt. Import your grocery list to see how your home and travel habits compare to your shopping basket.
        </p>
      </header>

      <nav className="nav-tabs">
        <NavButton 
          active={activeTab === 'import'} 
          icon="📥" label="Import" 
          onClick={() => handleTabSwitch('import')} 
        />
        <NavButton 
          active={activeTab === 'groceries'} 
          locked={!isImported}
          icon="🍎" label="Kitchen" 
          onClick={() => handleTabSwitch('groceries')} 
        />
        <NavButton 
          active={activeTab === 'house'} 
          locked={!isImported}
          icon="☀️" label="House" 
          onClick={() => handleTabSwitch('house')} 
        />
        <NavButton 
          active={activeTab === 'transport'} 
          locked={!isImported}
          icon="🚌" label="Trip" 
          onClick={() => handleTabSwitch('transport')} 
        />
        <NavButton 
          active={activeTab === 'receipt'} 
          locked={!isImported}
          icon="🧾" label="Receipt" 
          onClick={() => handleTabSwitch('receipt')} 
        />
      </nav>

      {/* TABS */}
      <div className={`panel ${activeTab === 'import' ? 'active' : ''}`}>
        <ImportTab onImport={() => {
          setIsImported(true);
          setTimeout(() => setActiveTab('groceries'), 800);
        }} />
      </div>

      <div className={`panel ${activeTab === 'groceries' ? 'active' : ''}`}>
        <KitchenTab totalCo2={groceryTotalCo2} />
      </div>

      <div className={`panel ${activeTab === 'house' ? 'active' : ''}`}>
        <HouseTab 
          area={houseArea} setArea={setHouseArea}
          type={houseType} setType={setHouseType}
          heat={heatingType} setHeat={setHeatingType}
          dailyCo2={houseCo2}
        />
      </div>

      <div className={`panel ${activeTab === 'transport' ? 'active' : ''}`}>
        <TransportTab 
          dist={tripDist} setDist={setTripDist}
          mode={tripMode} setMode={setTripMode}
          freq={tripFreq} setFreq={setTripFreq}
        />
      </div>

      <div className={`panel ${activeTab === 'receipt' ? 'active' : ''}`}>
        <ReceiptTab 
          house={houseCo2} 
          transport={dailyTransportCo2} 
          food={dailyGroceryCo2}
          total={totalDailyCo2}
        />
      </div>

    </div>
  );
};

const NavButton = ({ active, locked, icon, label, onClick }: any) => (
  <button 
    className={`nav-btn ${active ? 'active' : ''} ${locked ? 'locked' : ''}`}
    onClick={onClick}
  >
    <span>{icon}</span> {label}
  </button>
);

const ImportTab = ({ onImport }: { onImport: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      onImport();
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="card-section">
      <div className="section-title"><span>Start Here</span></div>
      <p className="section-desc">
        To compare your lifestyle emissions accurately, we first need to know what's in your fridge.
      </p>
      
      <button 
        className="import-btn-large" 
        onClick={handleClick} 
        disabled={loading}
      >
        <span style={{ fontSize: '1.4rem' }}>🛒</span>
        {loading ? 'Processing Receipt...' : 'Import from K-ruoka'}
      </button>
      
      <div className="import-sub">
        {loading ? 'Connecting to store account...' : 'Simulates secure API connection'}
      </div>
    </div>
  );
};

const KitchenTab = ({ totalCo2 }: { totalCo2: number }) => {
  return (
    <div className="card-section">
      <div className="section-title"><span>Your Basket</span></div>
      <p className="section-desc">
        This is the carbon footprint of your recent grocery shop. We'll use these items to measure your other habits.
      </p>
      
      <div className="grocery-bar-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
           <span>Carbon Composition</span>
           <strong>{totalCo2.toFixed(2)} kg CO₂</strong>
        </div>
        <div className="bar-chart-wrapper">
          {IMPORTED_ITEMS.map((item, i) => (
            <div 
              key={i} 
              className="bar-segment"
              style={{ 
                width: `${(item.co2 / totalCo2) * 100}%`,
                backgroundColor: item.color 
              }}
              title={`${item.name}: ${item.co2}kg`}
            />
          ))}
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
           100% of your basket's emissions
        </div>
      </div>

      <div className="grocery-grid">
        {IMPORTED_ITEMS.map((item, i) => (
          <div className="grocery-item" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="grocery-info">
              <span className="g-name">{item.icon} {item.name}</span>
              <span className="g-sub">Qty: {item.qty}</span>
            </div>
            <div className="g-val">{item.co2.toFixed(2)} kg</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HouseTab = ({ area, setArea, type, setType, heat, setHeat, dailyCo2 }: any) => {
  // Determine smart unit
  const { item: unit, count } = findSmartUnit(dailyCo2);

  return (
    <div className="card-section">
      <div className="section-title">
        <span>Daily Home Energy</span>
      </div>
      <p className="section-desc">
        Calculate the daily carbon cost of heating and powering your home based on size and efficiency.
      </p>

      <div className="input-row">
        <label>Floor Area (m²)</label>
        <input 
          type="number" 
          value={area} 
          onChange={(e) => setArea(e.target.value === '' ? '' : Number(e.target.value))} 
          min="0" 
        />
      </div>

      <div className="input-row">
        <label>Home Efficiency</label>
        <div className="btn-group">
          {['apartment_modern', 'apartment_old', 'detached_modern', 'detached_old'].map(v => (
             <button 
               key={v}
               className={`select-btn ${type === v ? 'selected' : ''}`}
               onClick={() => setType(v)}
             >
               {v.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
             </button>
          ))}
        </div>
      </div>
      
      <div className="input-row">
        <label>Heating Source</label>
        <div className="btn-group">
          {['district', 'oil', 'gas', 'heat_pump'].map(v => (
             <button 
               key={v}
               className={`select-btn ${heat === v ? 'selected' : ''}`}
               onClick={() => setHeat(v)}
             >
               {v.replace('_', ' ').toUpperCase()}
             </button>
          ))}
        </div>
      </div>

      <div className="visual-container">
        <div className="item-stack">
          {Array.from({ length: Math.min(count, 50) }).map((_, i) => (
            <div 
              key={i} 
              className="visual-item-unit"
              style={{ 
                // @ts-ignore custom prop
                '--item-color': unit.color,
                animationDelay: `${i * 0.03}s`
              }} 
            />
          ))}
          {count > 50 && (
             <div style={{ color: '#94a3b8', fontSize: '0.8rem', alignSelf: 'center' }}>+{count - 50}</div>
          )}
        </div>
        <div className="visual-label">
          Your home energy equals<br/>
          <strong>{count} x {unit.name}</strong>
        </div>
        <div className="visual-sub">
          1 {unit.name} ({unit.qty}) ≈ {unit.co2.toFixed(2)} kg CO₂
        </div>
      </div>
    </div>
  );
};

const TransportTab = ({ dist, setDist, mode, setMode, freq, setFreq }: any) => {
  // Weekly Calculations
  const carFactor = CONFIG.TRANSPORT['car'];
  const modeFactor = CONFIG.TRANSPORT[mode];
  
  const tripDist = dist === '' ? 0 : dist;
  const roundTripsPerWeek = freq; 
  
  // Weekly Emissions
  const weeklyCarCo2 = tripDist * 2 * roundTripsPerWeek * carFactor;
  const weeklyModeCo2 = tripDist * 2 * roundTripsPerWeek * modeFactor;
  
  // Calculate "Budget" for visualization
  // If mode is CAR, budget is the car's emission (Consumption).
  // If mode is NOT CAR, budget is the Savings (Car - Mode).
  const isCar = mode === 'car';
  
  const budgetCo2 = isCar 
    ? weeklyCarCo2 
    : Math.max(0, weeklyCarCo2 - weeklyModeCo2);

  // Grocery Spending Logic
  const visualItems = useMemo(() => {
    let budget = budgetCo2;
    const items = [];
    
    for (const item of IMPORTED_ITEMS) {
      if (budget <= 0.001) break;
      
      const cost = item.co2;
      const coveragePct = Math.min(1, budget / cost);
      
      items.push({ 
        ...item, 
        coverage: coveragePct 
      });
      
      budget -= (cost * coveragePct);
    }
    return items;
  }, [budgetCo2]);

  // Generate Summary Text
  const summaryText = useMemo(() => {
    if (tripDist === 0) return "Enter a distance to see the footprint.";

    if (isCar) {
      // Consumption Text
      let text = `Driving this route ${freq} days a week produces about ${weeklyModeCo2.toFixed(1)} kg of CO₂. `;
      text += "That's the same carbon footprint as ";
      
      if (visualItems.length === 0) return text + "a very small amount of food.";
      
      const fullItems = visualItems.filter(i => i.coverage >= 0.99);
      if (fullItems.length === IMPORTED_ITEMS.length) {
         text += "your ENTIRE grocery basket!";
      } else if (fullItems.length > 0) {
        text += fullItems.map(i => `all your ${i.name}`).join(", ");
        if (visualItems.length > fullItems.length) text += " and more...";
      } else {
        const item = visualItems[0];
        text += `about ${(item.coverage * 100).toFixed(0)}% of your ${item.name}.`;
      }
      return text;
    } else {
      // Savings Text
      if (budgetCo2 < 0.01) return "This trip has a very small footprint compared to driving.";
      if (visualItems.length === 0) return "You saved a little CO₂, but not enough to cover a full grocery item yet.";

      const fullItems = visualItems.filter(i => i.coverage >= 0.99);
      const partialItem = visualItems.find(i => i.coverage > 0 && i.coverage < 0.99);

      let text = `By taking the ${mode} instead of driving, you avoided about ${budgetCo2.toFixed(1)} kg of CO₂. `;
      text += "That covers the carbon footprint of ";

      if (fullItems.length > 0) {
        if (fullItems.length === IMPORTED_ITEMS.length) {
           text += "your ENTIRE grocery basket!";
        } else {
          const names = fullItems.map(i => `all your ${i.name}`).join(", ");
          text += names;
        }
      }

      if (partialItem) {
        if (fullItems.length > 0) text += " plus ";
        text += `about ${(partialItem.coverage * 100).toFixed(0)}% of your ${partialItem.name}.`;
      } else if (fullItems.length > 0 && fullItems.length < IMPORTED_ITEMS.length) {
         text += ".";
      }
      return text;
    }
  }, [budgetCo2, visualItems, mode, freq, tripDist, isCar, weeklyModeCo2]);


  return (
    <div className="card-section">
      <div className="section-title">
        <span>Trip Calculator</span>
      </div>
      <p className="section-desc">
        See how much your commute "costs" or "saves" in groceries compared to driving.
      </p>

      <div className="input-row">
        <label>One-way Distance (km)</label>
        <input 
          type="number" 
          value={dist} 
          onChange={(e) => setDist(e.target.value === '' ? '' : Number(e.target.value))} 
          min="0" 
        />
      </div>

      <div className="input-row">
        <label>Mode</label>
        <div className="btn-group">
          {[
            { id: 'car', label: '🚗 Car' },
            { id: 'bus', label: '🚌 Bus' },
            { id: 'train', label: '🚆 Train' },
            { id: 'bike', label: '🚲 Bike' }
          ].map(m => (
             <button 
               key={m.id}
               className={`select-btn transport-btn ${mode === m.id ? 'selected' : ''}`}
               onClick={() => setMode(m.id)}
             >
               {m.label}
             </button>
          ))}
        </div>
      </div>

      <div className="input-row">
        <label>Commute days per week</label>
        <div className="btn-group">
          {[1,2,3,4,5,6,7].map(n => (
            <button 
              key={n}
              className={`select-btn freq-btn ${freq === n ? 'selected' : ''}`}
              onClick={() => setFreq(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="metaphor-card">
        <div style={{ fontSize: '1rem', marginBottom: 16, lineHeight: '1.5', textAlign: 'left' }}>
          {summaryText}
        </div>
        
        <div className="grocery-grid" style={{ gap: 12 }}>
          {visualItems.map((item, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                <span>{item.icon} {item.name}</span>
                <strong>{(item.coverage * 100).toFixed(0)}%</strong>
              </div>
              <div style={{ height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${item.coverage * 100}%`, 
                  background: isCar ? '#fb7185' : 'var(--color-accent)', // Red for Car consumption, Blue/Green for savings
                  transition: 'width 0.5s ease' 
                }} />
              </div>
            </div>
          ))}
           {visualItems.length === 0 && budgetCo2 > 0 && (
              <div style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '0.85rem' }}>
                {isCar ? 'Driving creates emissions...' : 'Saving emissions...'} (Not enough for full item yet!)
              </div>
           )}
        </div>
        
        <div className={`comparison-pill ${isCar ? 'bad' : ''}`} style={{ marginTop: 20 }}>
          {isCar ? 'Total Weekly Emissions: ' : 'Total Weekly Savings: '} 
          {budgetCo2.toFixed(1)} kg CO₂
        </div>
      </div>
    </div>
  );
};

const ReceiptTab = ({ house, transport, food, total }: any) => {
  const [basket, setBasket] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // Fill basket logic
    let remaining = total;
    const items = [];
    const sorted = [...IMPORTED_ITEMS].sort((a,b) => b.co2 - a.co2);

    for(const item of sorted) {
      const count = Math.floor(remaining / item.co2);
      if (count > 0) {
        items.push(
          <div key={`${item.name}-${items.length}`} className="basket-item">
            {item.icon} <span>{count}x {item.name}</span>
          </div>
        );
        remaining -= (count * item.co2);
      }
    }
    
    if (remaining > 0.1) {
      items.push(
         <div key="dust" className="basket-item" style={{ opacity: 0.6 }}>
           <span>+ {remaining.toFixed(1)}kg dust</span>
         </div>
      );
    }
    setBasket(items);
  }, [total]);

  return (
    <div className="card-section" style={{ background: 'transparent', border: 'none', padding: 0 }}>
      <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 10 }}>
        Your Daily Carbon Footprint
      </p>
      
      <div className="receipt">
        <div className="receipt-header">
          ECOSENSE RECEIPT<br/>
          <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>{new Date().toLocaleDateString()}</span>
        </div>
        
        <ReceiptRow label="HOME ENERGY (24h)" val={house} />
        <ReceiptRow label="COMMUTE (Avg/Day)" val={transport} />
        <ReceiptRow label="FOOD (Avg/Day)" val={food} />
        
        <div className="receipt-row" style={{ color: '#64748b', fontSize: '0.8rem' }}>
           --------------------------------
        </div>
        
        <div className="receipt-total">
          <span>DAILY TOTAL</span>
          <span>{total.toFixed(2)} kg</span>
        </div>
        
        <div className="receipt-footer">
          <div className="basket-title">BASKET EQUIVALENT:</div>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', marginBottom: 8, color: '#64748b' }}>
            Your daily life burns the equivalent of:
          </p>
          <div className="basket-grid">
            {basket}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReceiptRow = ({ label, val }: any) => (
  <div className="receipt-row">
    <span>{label}</span>
    <span>{val > 0 ? val.toFixed(2) : '0.00'} kg</span>
  </div>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
