-- Création des tables pour le système de sécurité avancé

-- Table pour les logs de sécurité structurés
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  source TEXT NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les sessions avec rotation automatique
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les notifications temps réel
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'SECURITY')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour l'historique des modifications détaillé
CREATE TABLE modification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changes_summary TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour la détection d'anomalies
CREATE TABLE anomaly_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_id UUID,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour le rate limiting
CREATE TABLE rate_limit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les analytics
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  category TEXT NOT NULL,
  properties JSONB,
  user_id UUID,
  session_id UUID,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes pour les performances
CREATE INDEX idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX idx_security_logs_severity ON security_logs(severity);
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX idx_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX idx_notifications_admin_id ON notifications(admin_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_modification_history_admin_id ON modification_history(admin_id);
CREATE INDEX idx_modification_history_created_at ON modification_history(created_at DESC);
CREATE INDEX idx_anomaly_detections_created_at ON anomaly_detections(created_at DESC);
CREATE INDEX idx_rate_limit_ip_endpoint ON rate_limit_tracking(ip_address, endpoint);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- RLS Policies
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE modification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies pour admin seulement
CREATE POLICY "Admin access to security logs" ON security_logs FOR ALL USING (is_authenticated_admin());
CREATE POLICY "Admin access to sessions" ON admin_sessions FOR ALL USING (is_authenticated_admin());
CREATE POLICY "Admin access to notifications" ON notifications FOR ALL USING (is_authenticated_admin());
CREATE POLICY "Admin access to modification history" ON modification_history FOR ALL USING (is_authenticated_admin());
CREATE POLICY "Admin access to anomaly detections" ON anomaly_detections FOR ALL USING (is_authenticated_admin());
CREATE POLICY "Admin access to rate limiting" ON rate_limit_tracking FOR ALL USING (is_authenticated_admin());
CREATE POLICY "Admin access to analytics" ON analytics_events FOR ALL USING (is_authenticated_admin());

-- Fonction pour logger automatiquement les événements de sécurité
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT,
  p_severity TEXT,
  p_source TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO security_logs (event_type, severity, source, user_id, ip_address, user_agent, metadata)
  VALUES (p_event_type, p_severity, p_source, p_user_id, p_ip_address, p_user_agent, p_metadata)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Fonction pour détecter les anomalies de connexion
CREATE OR REPLACE FUNCTION detect_login_anomalies()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_logins INTEGER;
  different_ips INTEGER;
BEGIN
  -- Compter les connexions récentes (dernières 10 minutes)
  SELECT COUNT(*) INTO recent_logins
  FROM security_logs
  WHERE event_type = 'LOGIN_SUCCESS'
    AND user_id = NEW.user_id
    AND created_at > now() - interval '10 minutes';
  
  -- Si plus de 5 connexions en 10 minutes
  IF recent_logins > 5 THEN
    INSERT INTO anomaly_detections (detection_type, severity, description, metadata, user_id, ip_address)
    VALUES (
      'RAPID_LOGIN_ATTEMPTS',
      'HIGH',
      'Tentatives de connexion trop fréquentes détectées',
      jsonb_build_object('login_count', recent_logins, 'time_window', '10 minutes'),
      NEW.user_id,
      NEW.ip_address
    );
  END IF;
  
  -- Vérifier les connexions depuis différentes IP
  SELECT COUNT(DISTINCT ip_address) INTO different_ips
  FROM security_logs
  WHERE event_type = 'LOGIN_SUCCESS'
    AND user_id = NEW.user_id
    AND created_at > now() - interval '1 hour';
    
  IF different_ips > 3 THEN
    INSERT INTO anomaly_detections (detection_type, severity, description, metadata, user_id, ip_address)
    VALUES (
      'MULTIPLE_IP_ACCESS',
      'MEDIUM',
      'Connexions depuis plusieurs adresses IP détectées',
      jsonb_build_object('ip_count', different_ips, 'time_window', '1 hour'),
      NEW.user_id,
      NEW.ip_address
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour la détection d'anomalies
CREATE TRIGGER trigger_detect_login_anomalies
  AFTER INSERT ON security_logs
  FOR EACH ROW
  WHEN (NEW.event_type = 'LOGIN_SUCCESS')
  EXECUTE FUNCTION detect_login_anomalies();

-- Fonction pour la rotation automatique des sessions
CREATE OR REPLACE FUNCTION rotate_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Désactiver les sessions expirées
  UPDATE admin_sessions 
  SET is_active = false
  WHERE expires_at < now() 
    AND is_active = true;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Logger l'événement
  PERFORM log_security_event(
    'SESSION_ROTATION',
    'INFO',
    'SYSTEM',
    NULL,
    NULL,
    NULL,
    jsonb_build_object('expired_sessions', expired_count)
  );
  
  RETURN expired_count;
END;
$$;

-- Fonction pour nettoyer les anciennes données
CREATE OR REPLACE FUNCTION cleanup_old_security_data()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_logs INTEGER;
  deleted_analytics INTEGER;
BEGIN
  -- Supprimer les logs de plus de 6 mois
  DELETE FROM security_logs WHERE created_at < now() - interval '6 months';
  GET DIAGNOSTICS deleted_logs = ROW_COUNT;
  
  -- Supprimer les analytics de plus de 1 an
  DELETE FROM analytics_events WHERE created_at < now() - interval '1 year';
  GET DIAGNOSTICS deleted_analytics = ROW_COUNT;
  
  RETURN format('Nettoyage terminé: %s logs supprimés, %s événements analytics supprimés', 
                deleted_logs, deleted_analytics);
END;
$$;