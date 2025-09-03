-- Corriger les problèmes de sécurité détectés

-- 1. Fixer les fonctions avec search_path mutable
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
SET search_path = public
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

CREATE OR REPLACE FUNCTION detect_login_anomalies()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION rotate_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION cleanup_old_security_data()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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