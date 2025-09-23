import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistantSection: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Bonjour ! 👋 Je suis l'assistant IA de Rayane Jerbi, expert en cybersécurité. Je peux répondre à toutes vos questions sur :\n\n• Son expertise et ses compétences\n• Ses projets et réalisations\n• Les services qu'il propose\n• Des conseils en cybersécurité\n• Tout autre sujet technique\n\nComment puis-je vous aider aujourd'hui ?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      console.log('Sending message to AI assistant:', currentInput);
      
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { message: currentInput }
      });

      console.log('Response from AI assistant:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Erreur de connexion: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je rencontre des difficultés techniques. Vous pouvez contacter directement Rayane :\n\n📧 rayane.jerbi@yahoo.com\n📞 +33 6 20 28 41 14\n\nOu réessayer dans quelques instants.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Problème de connexion",
        description: "L'assistant IA rencontre des difficultés. Contactez directement Rayane.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Quelles sont les compétences de Rayane ?",
    "Quels services proposez-vous ?",
    "Parlez-moi de vos projets récents",
    "Comment me protéger contre les cyberattaques ?",
    "Quels sont vos tarifs ?"
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4 text-primary">
            Assistant IA Cybersécurité
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Posez toutes vos questions sur la cybersécurité, mes compétences et mes services. 
            Je suis là pour vous aider !
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="cyber-border shadow-xl bg-background/95 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-orbitron flex items-center justify-center">
                <Bot className="h-6 w-6 mr-3 text-primary" />
                Chat avec l'Expert IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Questions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Questions rapides :</h3>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputText(question)}
                      className="text-xs cyber-border hover:cyber-glow transition-all"
                      disabled={isLoading}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <ScrollArea className="h-96 border rounded-lg p-4 bg-muted/20" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-start space-x-3 max-w-[85%] ${
                          message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          message.isUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary text-secondary-foreground'
                        }`}>
                          {message.isUser ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <Bot className="h-5 w-5" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-4 ${
                            message.isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background border'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div className="bg-background border rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">L'expert réfléchit...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Input Area */}
              <div className="flex space-x-3">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question sur la cybersécurité..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AIAssistantSection;