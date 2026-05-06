import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const loadEnv = () => {
  try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1]] = match[2].trim();
      }
    });
  } catch {}
};
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://swbhsewxzhxgxmdxahcz.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const { data: properties, error } = await supabase.from('properties').select('id, address, location');
  
  if (error) {
    console.error("Error fetching properties:", error);
    return;
  }

  let sqlStatements = "";

  for (const property of properties) {
    const query = `${property.address}, ${property.location}`;
    console.log(`Geocoding: ${query}`);
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;
        console.log(`  -> Found: ${lat}, ${lon}`);
        sqlStatements += `UPDATE properties SET lat = ${lat}, lng = ${lon} WHERE id = '${property.id}';\n`;
      } else {
        console.log(`  -> Not found. Trying city only...`);
        // Fallback to searching only location
        await sleep(1100);
        const fbResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(property.location)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json'
          }
        });
        const fbData = await fbResponse.json();
        if (fbData && fbData.length > 0) {
           const lat = fbData[0].lat;
           const lon = fbData[0].lon;
           console.log(`  -> Found City: ${lat}, ${lon}`);
           sqlStatements += `UPDATE properties SET lat = ${lat}, lng = ${lon} WHERE id = '${property.id}';\n`;
        } else {
           console.log(`  -> Still not found.`);
        }
      }
    } catch (e) {
      console.error(`  -> Error: ${e.message}`);
    }
    
    // Respect Nominatim TOS (1 request per second max)
    await sleep(1500);
  }

  fs.writeFileSync('update_coords.sql', sqlStatements);
  console.log("SQL file generated: update_coords.sql");
}

run();
