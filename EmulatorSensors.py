import streamlit as st
import pandas as pd
import requests
import json
from datetime import datetime, timedelta
import time
import urllib3

# --- Configuração SSL ---
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

st.set_page_config(page_title="QA Emulator Suite", layout="wide", page_icon="🎛️")

# ==========================================
# 1. GERENCIAMENTO DE URLS (VIA SECRETS)
# ==========================================
def get_urls(env):
    prefix = env.upper() + "_"
    try:
        return {
            'AUTH_PROJ': st.secrets[f"{prefix}AUTH_PROJ"],
            'SENSOR_ALARM': st.secrets[f"{prefix}SENSOR_ALARM"],
            'WEBHOOK_ONU': st.secrets[f"{prefix}WEBHOOK_ONU"],
            'ONU_SEARCH_BASE': st.secrets[f"{prefix}ONU_SEARCH_BASE"],
            'OTDR_LIST': st.secrets[f"{prefix}OTDR_LIST"],
            'OTDR_ALARM_BASE': st.secrets[f"{prefix}OTDR_ALARM_BASE"]
        }
    except Exception as e:
        st.error(f"Erro ao carregar secrets para ambiente {env}: Falta chave {e}")
        return {}

# ==========================================
# 2. LÓGICA DE TOKEN (RENOVAÇÃO SILENCIOSA)
# ==========================================
def perform_login(env, username, password):
    urls = get_urls(env)
    if not urls: return False, "URLs não configuradas no secrets.toml"
    
    base_url = urls['AUTH_PROJ']
    url_auth = f"{base_url}/auth/"
    data = {"password": password, "username": username}
    headers = {'Content-Type': 'application/json'}
    
    try:
        r = requests.put(url_auth, json=data, headers=headers, verify=False)
        if r.status_code == 200:
            token = r.json()['id_token']
            st.session_state['token'] = token
            st.session_state['token_time'] = datetime.now()
            st.session_state['creds'] = {"user": username, "pass": password, "env": env}
            return True, "Login realizado com sucesso!"
        else:
            return False, f"Erro {r.status_code}: {r.text}"
    except Exception as e:
        return False, f"Erro de conexão: {e}"

def ensure_token_validity():
    if 'token_time' not in st.session_state or 'creds' not in st.session_state:
        return
    now = datetime.now()
    last_login = st.session_state['token_time']
    
    if (now - last_login).total_seconds() > 3000:
        creds = st.session_state['creds']
        urls = get_urls(creds['env'])
        if not urls: return
        base_url = urls['AUTH_PROJ']
        url_auth = f"{base_url}/auth/"
        data = {"password": creds['pass'], "username": creds['user']}
        headers = {'Content-Type': 'application/json'}
        try:
            r = requests.put(url_auth, json=data, headers=headers, verify=False)
            if r.status_code == 200:
                st.session_state['token'] = r.json()['id_token']
                st.session_state['token_time'] = datetime.now()
        except:
            pass

# ==========================================
# 3. FUNÇÕES DE API
# ==========================================

def get_projects_from_api(env, tenant_id, token):
    ensure_token_validity()
    current_token = st.session_state.get('token', token)
    
    base_url = get_urls(env)['AUTH_PROJ']
    url = f"{base_url}/companies/{tenant_id}/projects?limit=50"
    headers = {'Authorization': current_token, 'Content-Type': 'application/json', 'Accept': '*/*'}
    try:
        response = requests.get(url, headers=headers, verify=False)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list): return data
            return data.get('items') or data.get('projects') or data.get('data') or []
        else:
            st.error(f"Erro Projetos ({response.status_code}): {response.text}")
            return []
    except Exception as e:
        st.error(f"Erro conexão Projetos: {e}")
        return []

def get_sensors_from_project(env, tenant_id, project_id, token):
    ensure_token_validity()
    current_token = st.session_state.get('token', token)

    base_url = get_urls(env)['SENSOR_ALARM']
    url = f"{base_url}/companies/{tenant_id}/{project_id}/devices?limit=100&project={project_id}"
    headers = {'Authorization': current_token, 'Content-Type': 'application/json', 'Accept': '*/*'}
    try:
        response = requests.get(url, headers=headers, verify=False)
        if response.status_code == 200:
            data = response.json()
            items = []
            if isinstance(data, list): items = data
            elif 'items' in data: items = data['items']
            elif 'devices' in data: items = data['devices']
            elif 'data' in data: items = data['data']
            
            processed = []
            for item in items:
                rede_id = (item.get('identificator_in_network') or 
                           item.get('dev_eui') or 
                           item.get('network_identificator'))
                s_desc = item.get('description') or item.get('name') or "Sem Nome"
                
                if rede_id:
                    processed.append({'id': rede_id, 'name': s_desc, 'type': 'REDE'})
                else:
                    uuid = item.get('id')
                    if uuid: processed.append({'id': uuid, 'name': s_desc, 'type': 'UUID'})
            return processed
        else:
            st.error(f"Erro Sensores ({response.status_code}): {response.text}")
            return []
    except Exception as e:
        st.error(f"Erro conexão Sensores: {e}")
        return []

def send_sensor_alarm(env, id_token, company_id, dev_eui, cause):
    ensure_token_validity()
    current_token = st.session_state.get('token', id_token)

    base_url = get_urls(env)['SENSOR_ALARM']
    dev_eui_clean = str(dev_eui).strip()
    url = f"{base_url}/companies/{company_id}/uplink_emulator/{dev_eui_clean}?payload_type={cause}"
    headers = {'Authorization': current_token, 'Accept-Encoding': 'gzip, deflate, br'}
    try:
        response = requests.get(url, headers=headers, verify=False)
        return response.status_code, response.text
    except Exception as e:
        return 0, str(e)

def get_onus_from_api(env, tenant_id, token):
    ensure_token_validity()
    current_token = st.session_state.get('token', token)

    base_url = get_urls(env)['ONU_SEARCH_BASE']
    url = f"{base_url}/{tenant_id}/api/external-onu/search?page=0&size=100"
    
    auth_header = current_token if current_token.startswith("Bearer ") else f"Bearer {current_token}"
    
    headers = {
        'Authorization': auth_header, 
        'schema': tenant_id,
        'Content-Type': 'application/json'
    }
    
    payload = {
        "creation-date": "", "name": "", "ip": "", 
        "isManual": "", "model": "", "serial-number": ""
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, verify=False)
        
        if response.status_code == 200:
            data = response.json()
            items = []
            if isinstance(data, dict):
                items = data.get('content', [])
            processed = []
            for item in items:
                if isinstance(item, dict):
                    serial = (
                        item.get('serialNumber') or 
                        item.get('serial-number') or 
                        item.get('sn')
                    )
                    desc = (
                        item.get('description') or 
                        item.get('name') or 
                        "ONU Sem Nome"
                    )
                    if serial:
                        processed.append({'sn': serial, 'name': desc})
            return processed
        else:
            return []
    except Exception as e:
        st.error(f"Erro conexão ONUs: {e}")
        return []

def send_onu_event(webhook_base, tenant_id, serial, status, host_name="HOST01"):
    url = f"{webhook_base}{tenant_id}"
    current_time = datetime.now().strftime("%H:%M:%S")
    current_date = datetime.now().strftime("%Y.%m.%d")
    
    event_status = status
    if status == "Loss of Signal": event_status = "LOS"
    
    body = {
        "host_name": host_name,
        "host_source": "10.0.0.1",
        "host_serialnumber": f"{serial}",
        "event_name": f"ONU [OltId.OnuId]: [1.1] is {event_status}",
        "event_time": current_time,
        "event_date": current_date,
        "host_model": "onu",
    }
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(url, json=body, headers=headers, verify=False)
        return response.status_code, response.text
    except Exception as e:
        return 0, str(e)

def get_otdrs_from_api(env, tenant_id, project_id, token):
    ensure_token_validity()
    current_token = st.session_state.get('token', token)

    base_url = get_urls(env)['SENSOR_ALARM'] 
    url = f"{base_url}/companies/{tenant_id}/{project_id}/devices?limit=100&project={project_id}"
    
    headers = {
        'Authorization': current_token,
        'Content-Type': 'application/json',
        'Accept': '*/*'
    }
    
    try:
        response = requests.get(url, headers=headers, verify=False)
        
        if response.status_code == 200:
            data = response.json()
            items = []
            
            if isinstance(data, list): items = data
            elif 'items' in data: items = data['items']
            elif 'devices' in data: items = data['devices']
            elif 'data' in data: items = data['data']
            
            processed = []
            for item in items:
                if isinstance(item, dict) and item.get("network_server") == "SNMP":
                    o_id = item.get('id')
                    o_desc = item.get('description') or "OTDR Sem Descrição"
                    o_name = item.get('name') or o_desc
                    
                    o_serial = item.get('serial_number') or item.get('serialNumber') or ""
                    o_ident = item.get('identificator_in_network') or item.get('network_identificator') or ""
                    
                    if o_id:
                        processed.append({
                            'id': o_id, 
                            'name': o_name,
                            'description': o_desc,
                            'serial_number': o_serial,
                            'identificator_in_network': o_ident
                        })
            
            return processed
        else:
            st.error(f"Erro ao buscar OTDRs ({response.status_code}): {response.text}")
            return []
    except Exception as e:
        st.error(f"Erro conexão OTDRs: {e}")
        return []

def send_otdr_alarm(env, token, tenant_id, project_id, project_name, otdr_name, otdr_id,
                    severity_name, severity_code, distance, attenuation,
                    event_name, event_10_2_code, event_10_6_str, 
                    serial_number, formatted_desc): 
    ensure_token_validity()
    current_token = st.session_state.get('token', token)
    
    base_url = get_urls(env)['OTDR_ALARM_BASE']
    url = f"{base_url}/api/otdr-alarms"
    
    auth_header = current_token if current_token.startswith("Bearer ") else f"Bearer {current_token}"
    
    headers = {
        'Authorization': auth_header,
        'Content-Type': 'application/json'
    }
    
    # Recupera IPs genéricos do secrets para anonimizar o código
    source_ip = st.secrets.get("OTDR_SOURCE_IP", "127.0.0.1:5000")
    rtu_ip = st.secrets.get("OTDR_RTU_IP", "127.0.0.1")
    
    current_ts = datetime.now().strftime("%b %d %Y - %H:%M")
    msg_summary = (f"RTU : {otdr_name} ({rtu_ip})\\n\\t"
                   f"Alarm type: OPTICAL\\n\\t"
                   f"Timestamp: {current_ts}\\n\\t"
                   f"Severity: {severity_name.upper()}\\n\\t"
                   f"Link name: Link 1 - Port 1\\n\\t"
                   f"Probable cause: {event_name}\\n\\t"
                   f"Optical distance: {distance}KM")

    varbinds = [
        {"name": "1.3.6.1.6.3.1.1.4.1.0", "type": "ObjectIdentifier", "value": "1.3.6.1.4.1.35873.5.1.2.1.2.1"},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.2", "type": "OctetString", "value": str(serial_number)}, 
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.3", "type": "OctetString", "value": msg_summary},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.5", "type": "Integer", "value": "1"},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.4", "type": "OctetString", "value": "port=1"},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.6", "type": "Integer", "value": "1"},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.7", "type": "Integer", "value": str(severity_code)},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.8", "type": "OctetString", "value": "\\u0007\\ufffd\\u0003\\u0005\\n,\\r\\u0000"},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.9", "type": "OctetString", "value": formatted_desc}, 
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.1", "type": "OctetString", "value": "Link 1"},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.2", "type": "Integer", "value": str(event_10_2_code)},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.3", "type": "OctetString", "value": attenuation},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.4", "type": "OctetString", "value": distance},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.5", "type": "OctetString", "value": ""},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.10.6", "type": "OctetString", "value": event_10_6_str},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.1", "type": "OctetString", "value": ""},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.2", "type": "OctetString", "value": ""},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.3", "type": "OctetString", "value": ""},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.4", "type": "OctetString", "value": ""},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.5", "type": "OctetString", "value": ""},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.6", "type": "OctetString", "value": ""},
        {"name": "1.3.6.1.4.1.35873.5.1.2.1.1.1.11.7", "type": "OctetString", "value": ""}
    ]
    
    inner_payload = {
        "tenant_id": tenant_id,
        "project_id": project_id,
        "project_name": project_name,
        "otdr_name": otdr_name,
        "otdr_id": otdr_id,
        "payload": {
            "request_id": "",
            "error_index": 0,
            "error_status": 0,
            "source_ip": source_ip,
            "varbinds": varbinds
        }
    }
    
    body = {"Message": json.dumps(inner_payload)}
    
    try:
        response = requests.post(url, json=body, headers=headers, verify=False)
        return response.status_code, response.text
    except Exception as e:
        return 0, str(e)

# ==========================================
# 4. BARRA LATERAL
# ==========================================
with st.sidebar:
    st.header("Autenticação")
    st.markdown("---")

    env = st.selectbox("Ambiente", ["HOM", "DEV", "PROD"])
    user_eyon = st.text_input("Usuário", value="")
    pass_eyon = st.text_input("Senha", type="password")
    
    if st.button("Gerar Token"):
        with st.spinner("Logando..."):
            success, msg = perform_login(env, user_eyon, pass_eyon)
            if success:
                st.success(msg)
            else:
                st.error(msg)

# ==========================================
# 5. INTERFACE PRINCIPAL
# ==========================================
st.title("🎛️ Painel de Simulação")

tab_sensores, tab_onus, tab_OTDR = st.tabs(["🌐 Sensores", "📡 ONUs", "📈 OTDR"])

# Recupera tenants padrão dos secrets (evita expor IDs reais no código fonte)
def_tenant_s = st.secrets.get("DEFAULT_TENANT_ID", "")
def_tenant_o = st.secrets.get("DEFAULT_TENANT_ONU", def_tenant_s)

# --- ABA 1: SENSORES ---
with tab_sensores:
    if 'token' not in st.session_state:
        st.warning("⚠️ Login necessário.")
    else:
        c1, c2 = st.columns([1, 3])
        with c1:
            tenant_input = st.text_input("Tenant ID", value=def_tenant_s, key="tenant_sensors")
        with c2:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("🔍 Buscar Projetos", key="btn_proj_s"):
                projs = get_projects_from_api(env, tenant_input, st.session_state['token'])
                st.session_state['projetos_raw'] = projs

        if st.session_state.get('projetos_raw'):
            raw_projects = st.session_state['projetos_raw']
            proj_options = {}
            for p in raw_projects:
                p_name = p.get('name') or p.get('projectName') or "Sem Nome"
                p_id = p.get('id') or p.get('projectId')
                if p_id: proj_options[f"{p_name} ({p_id})"] = p_id

            selected_label = st.selectbox("Projeto", options=list(proj_options.keys()))
            
            if selected_label and st.button("📥 Carregar Sensores", key="btn_sens_list"):
                proj_id = proj_options[selected_label]
                sensores = get_sensors_from_project(env, tenant_input, proj_id, st.session_state['token'])
                st.session_state['sensores_objs'] = sensores
                if not sensores: st.warning("Lista vazia.")
                else: 
                    ok_count = sum(1 for s in sensores if s['type']=='REDE')
                    st.success(f"{len(sensores)} sensores ({ok_count} válidos).")

        if st.session_state.get('sensores_objs'):
            st.markdown("---")
            sensor_objs = st.session_state['sensores_objs']
            
            s_map = {}
            for s in sensor_objs:
                lbl = f"{s['name']} ({s['id']})"
                if s['type'] == 'UUID': lbl += " ⚠️ UUID"
                s_map[lbl] = s['id']
            
            sel = st.multiselect("Sensores a serem afetados:", options=list(s_map.keys()), default=list(s_map.keys()))
            
            if sel:
                ids = [s_map[x] for x in sel]
                
                sub_tab_unico_s, sub_tab_carga_s = st.tabs(["🎯 Disparo Único", "🔁 Teste de Carga (Loop)"])
                
                with sub_tab_unico_s:
                    df = pd.DataFrame({"Sensor": sel, "ID": ids, "Causa": ["KEEP_ALIVE"]*len(ids)})
                    
                    edited = st.data_editor(
                        df,
                        column_config={
                            "Sensor": st.column_config.TextColumn("Sensor", disabled=True),
                            "ID": None,
                            "Causa": st.column_config.SelectboxColumn("Causa", options=["KEEP_ALIVE", "OPTICAL_POWER_ALERT", "BATTERY_ALERT", "TEMPERATURE_ALERT"], required=True)
                        },
                        hide_index=True, use_container_width=True, key="editor_sensores"
                    )
                    
                    if st.button("🚀 Disparar Sensores (Único)", type="primary"):
                        bar = st.progress(0)
                        ok = 0
                        for i, r in edited.iterrows():
                            c, txt = send_sensor_alarm(env, st.session_state['token'], tenant_input, r['ID'], r['Causa'])
                            if c == 200: 
                                ok += 1
                            else:
                                st.toast(f"Erro no Sensor {r['ID']}: {txt}")
                            bar.progress((i+1)/len(edited))
                            time.sleep(0.05)
                        st.success(f"Enviados: {ok}/{len(edited)}")

                with sub_tab_carga_s:
                    c_rep, c_del = st.columns(2)
                    with c_rep:
                        repeticoes = st.number_input("Repetições do Ciclo (Rodadas)", min_value=1, value=50, step=1)
                    with c_del:
                        delay = st.number_input("Delay entre envios (seg)", min_value=0.0, value=0.1, step=0.1)
                    
                    causas_disp = ["KEEP_ALIVE", "OPTICAL_POWER_ALERT", "BATTERY_ALERT", "TEMPERATURE_ALERT"]
                    causas_alternadas = st.multiselect("Causas a alternar em cada rodada", options=causas_disp, default=["KEEP_ALIVE", "OPTICAL_POWER_ALERT"])
                    
                    if st.button("🚀 Iniciar Teste de Carga", type="primary", key="btn_carga_s"):
                        if not causas_alternadas:
                            st.error("Selecione pelo menos uma causa.")
                        else:
                            total_steps = repeticoes * len(causas_alternadas) * len(ids)
                            bar = st.progress(0, text="Preparando Teste de Carga...")
                            step = 0
                            ok = 0
                            
                            for i in range(repeticoes):
                                for cause in causas_alternadas:
                                    for sensor_id in ids:
                                        c, txt = send_sensor_alarm(env, st.session_state['token'], tenant_input, sensor_id, cause)
                                        if c == 200: 
                                            ok += 1
                                        else:
                                            st.toast(f"Erro no {sensor_id}: {txt}")
                                        step += 1
                                        bar.progress(step/total_steps, text=f"Rodada {i+1}/{repeticoes} | Causa: {cause} | Enviados: {step}/{total_steps}")
                                        time.sleep(delay)
                            
                            st.success(f"Teste de Carga Concluído! Sucessos: {ok}/{total_steps}")

# --- ABA 2: ONUS ---
with tab_onus:
    if 'token' not in st.session_state:
        st.warning("⚠️ Login necessário.")
    else:
        col_onu_1, col_onu_2 = st.columns([1, 3])
        with col_onu_1:
            tenant_onu = st.text_input("Tenant ID", value=def_tenant_o, key="tenant_onus")
        with col_onu_2:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("🔍 Buscar ONUs", key="btn_onu_search"):
                with st.spinner("Consultando..."):
                    onus = get_onus_from_api(env, tenant_onu, st.session_state['token'])
                    st.session_state['lista_onus_objs'] = onus
                    st.session_state['busca_realizada'] = True 

        if st.session_state.get('lista_onus_objs'):
            st.success(f"{len(st.session_state['lista_onus_objs'])} ONUs encontradas!")
            st.markdown("---")
            
            onus_objs = st.session_state['lista_onus_objs']
            onu_map = {}
            for o in onus_objs:
                label = f"{o['name']} (SN: {o['sn']})"
                onu_map[label] = o['sn']
            
            sel_onus = st.multiselect("Selecione as ONUs a serem afetadas:", options=list(onu_map.keys()), default=list(onu_map.keys()))
            
            if sel_onus:
                sns_final = [onu_map[l] for l in sel_onus]
                
                c_glob1, c_glob2 = st.columns(2)
                with c_glob1:
                    host_name_input = st.text_input("Host Name Global", value="HOST01")
                
                st.markdown("<br>", unsafe_allow_html=True)
                
                sub_tab_unico_o, sub_tab_carga_o = st.tabs(["🎯 Disparo Único", "🔁 Teste de Carga (Loop)"])
                
                with sub_tab_unico_o:
                    df_onu = pd.DataFrame({
                        "ONU": sel_onus,
                        "Serial": sns_final,
                        "Status": ["Active"] * len(sns_final)
                    })
                    
                    status_options = ["Active", "Inactive", "Alarm"]
                    
                    edited_onu = st.data_editor(
                        df_onu,
                        column_config={
                            "ONU": st.column_config.TextColumn("Dispositivo", disabled=True, width="large"),
                            "Serial": st.column_config.TextColumn("Serial Number", disabled=True),
                            "Status": st.column_config.SelectboxColumn("Novo Status", options=status_options, required=True)
                        },
                        hide_index=True, use_container_width=True, key="editor_onus"
                    )
                    
                    if st.button("📡 Disparar Status para ONUs (Único)", type="primary"):
                        base_webhook = get_urls(env)['WEBHOOK_ONU']
                        bar_onu = st.progress(0)
                        ok_onu = 0
                        
                        for i, row in edited_onu.iterrows():
                            sn = row['Serial']
                            stt = row['Status']
                            code, txt = send_onu_event(base_webhook, tenant_onu, sn, stt, host_name_input)
                            
                            if 200 <= code < 300:
                                ok_onu += 1
                            else:
                                st.toast(f"Erro no {sn}: {txt}")
                            
                            bar_onu.progress((i+1)/len(edited_onu))
                            time.sleep(0.05)
                        
                        st.success(f"Finalizado! {ok_onu}/{len(edited_onu)} eventos enviados.")

                with sub_tab_carga_o:
                    c_rep_o, c_del_o = st.columns(2)
                    with c_rep_o:
                        repeticoes_o = st.number_input("Repetições do Ciclo (Rodadas)", min_value=1, value=10, step=1, key="rep_onu")
                    with c_del_o:
                        delay_o = st.number_input("Delay entre envios (seg)", min_value=0.0, value=0.1, step=0.1, key="del_onu")
                    
                    status_disp = ["Active", "Inactive", "Alarm"]
                    status_alternados = st.multiselect("Status a alternar em cada rodada", options=status_disp, default=["Active", "Alarm"], key="stat_onu")
                    
                    if st.button("📡 Iniciar Teste de Carga nas ONUs", type="primary", key="btn_carga_o"):
                        if not status_alternados:
                            st.error("Selecione pelo menos um status.")
                        else:
                            base_webhook = get_urls(env)['WEBHOOK_ONU']
                            total_steps_o = repeticoes_o * len(status_alternados) * len(sns_final)
                            bar_onu_carga = st.progress(0, text="Preparando Teste de Carga...")
                            step_o = 0
                            ok_o = 0
                            
                            for i in range(repeticoes_o):
                                for stt in status_alternados:
                                    for sn in sns_final:
                                        code, txt = send_onu_event(base_webhook, tenant_onu, sn, stt, host_name_input)
                                        if 200 <= code < 300: 
                                            ok_o += 1
                                        else:
                                            st.toast(f"Erro no {sn}: {txt}")
                                        
                                        step_o += 1
                                        bar_onu_carga.progress(step_o/total_steps_o, text=f"Rodada {i+1}/{repeticoes_o} | Status: {stt} | Enviados: {step_o}/{total_steps_o}")
                                        time.sleep(delay_o)
                            
                            st.success(f"Teste de Carga Concluído! Sucessos: {ok_o}/{total_steps_o}")

        elif st.session_state.get('busca_realizada'):
            st.warning("Nenhuma ONU encontrada (Verifique se o Tenant ID está correto e se há ONUs cadastradas).")

# --- ABA 3: OTDR ---
with tab_OTDR:
    if 'token' not in st.session_state:
        st.warning("⚠️ Login necessário.")
    else:
        c1, c2 = st.columns([1, 3])
        with c1:
            tenant_input_otdr = st.text_input("Tenant ID", value=def_tenant_s, key="tenant_otdr")
        with c2:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("🔍 Buscar Projetos", key="btn_proj_o"):
                projs = get_projects_from_api(env, tenant_input_otdr, st.session_state['token'])
                st.session_state['projetos_raw_otdr'] = projs

        if st.session_state.get('projetos_raw_otdr'):
            raw_projects = st.session_state['projetos_raw_otdr']
            proj_options = {}
            for p in raw_projects:
                p_name = p.get('name') or p.get('projectName') or "Sem Nome"
                p_id = p.get('id') or p.get('projectId')
                if p_id: proj_options[f"{p_name} ({p_id})"] = p_id

            selected_label_otdr = st.selectbox("Projeto", options=list(proj_options.keys()), key="sel_proj_otdr")
            
            if selected_label_otdr and st.button("📥 Buscar OTDRs", key="btn_otdr_list"):
                with st.spinner("Consultando dispositivos SNMP..."):
                    proj_id = proj_options[selected_label_otdr]
                    otdrs = get_otdrs_from_api(env, tenant_input_otdr, proj_id, st.session_state['token'])
                    st.session_state['otdrs_objs'] = otdrs
                    st.session_state['busca_otdr_realizada'] = True

        if st.session_state.get('otdrs_objs'):
            st.success(f"{len(st.session_state['otdrs_objs'])} OTDRs encontrados!")
            st.markdown("---")
            
            otdrs_objs = st.session_state['otdrs_objs']
            otdr_map = {}
            for o in otdrs_objs:
                label = f"{o['description']} (ID: {o['id']})"
                otdr_map[label] = o 
            
            if not otdr_map:
                st.error("A lista de OTDRs foi encontrada, mas o formato dos dados é desconhecido (faltam os IDs).")
                
            sel_otdrs = st.multiselect("Selecione os OTDRs alvos do Alarme:", options=list(otdr_map.keys()), default=list(otdr_map.keys()))
            
            map_severity = {
                "Warning": 2, "Minor": 3, 
                "Major": 4, "Critical": 5, "Indeterminate": 6
            }
            
            map_events = {
                "Nenhuma falha detectada": (0, ""),
                "FiberCut": (1, ""),
                "Injection": (2, ""),
                "Attenuation": (3, ""),
                "ShortEventLevel": (4, ""),
                "Connector": (0, "Connector"),
                "Splice break or connector disconnected": (0, "Splice break or connector disconnected"),
                "Connector disconnected or strong bend": (0, "Connector disconnected or strong bend"),
                "Fiber break": (0, "Fiber break"),
                "Fiber bending on splice or connector": (0, "Fiber bending on splice or connector"),
                "Connector bending, dirty, loose": (0, "Connector bending, dirty, loose"),
                "Fiber bending": (0, "Fiber bending")
            }
            
            if sel_otdrs:
                st.markdown("### ⚙️ Parâmetros do Alarme")
                cp1, cp2 = st.columns(2)
                
                with cp1:
                    sev_choice = st.selectbox("Severidade", options=list(map_severity.keys()), index=3)
                    dist_val = st.text_input("Distância (km)", value="")
                with cp2:
                    evt_choice = st.selectbox("Evento / Causa", options=list(map_events.keys()))
                    att_val = st.text_input("Atenuação", value="")
                
                st.markdown("<br>", unsafe_allow_html=True)
                
                if st.button("🚀 Disparar Alarme Dinâmico", type="primary"):
                    bar_otdr = st.progress(0)
                    ok_otdr = 0
                    
                    proj_id = proj_options[selected_label_otdr]
                    proj_name = selected_label_otdr.split(" (")[0] 
                    
                    sev_choice_envio = sev_choice
                    sev_code = map_severity.get(sev_choice, 5)
                    evt_10_2, evt_10_6 = map_events[evt_choice]
                    
                    if evt_choice == "Nenhuma falha detectada":
                        sev_choice_envio = "Clear"
                        sev_code = 1
                    
                    for i, lbl in enumerate(sel_otdrs):
                        otdr_data = otdr_map[lbl]
                        otdr_id = otdr_data['id']
                        otdr_name = otdr_data.get('name', 'OTDR Sem Nome')
                        
                        serial_number = otdr_data.get('serial_number', '')
                        desc = otdr_data.get('description', '')
                        ident = otdr_data.get('identificator_in_network', '')
                        
                        if ident:
                            formatted_desc = f"{desc} ({ident})"
                        else:
                            formatted_desc = desc

                        code, txt = send_otdr_alarm(
                            env, st.session_state['token'], 
                            tenant_input_otdr, proj_id, proj_name, otdr_name, otdr_id,
                            sev_choice_envio, sev_code, dist_val, att_val,
                            evt_choice, evt_10_2, evt_10_6,
                            serial_number, formatted_desc 
                        )
                        
                        if 200 <= code < 300:
                            ok_otdr += 1
                        else:
                            st.toast(f"Erro no OTDR {otdr_id}: {txt}")
                        
                        bar_otdr.progress((i+1)/len(sel_otdrs))
                        time.sleep(0.05)
                    
                    st.success(f"Finalizado! {ok_otdr}/{len(sel_otdrs)} alarmes enviados.")

        elif st.session_state.get('busca_otdr_realizada'):
            st.warning("Nenhum OTDR encontrado neste Tenant ou Projeto.")