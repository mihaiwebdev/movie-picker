import { Injectable, inject } from '@angular/core';
import { doc, setDoc } from 'firebase/firestore';
import { from } from 'rxjs';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private readonly configService = inject(ConfigurationService);

  private readonly db = this.configService.db;
  private readonly messagesCollection = 'messages';

  public contactUs(subject: string, summary: string, senderEmail: string) {
    const messageObj = {
      senderEmail,
      subject,
      summary,
    };
    return from(
      setDoc(doc(this.db, this.messagesCollection, senderEmail), messageObj),
    );
  }
}
