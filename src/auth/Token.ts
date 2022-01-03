import {Document} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

export type TokenDocument = Token & Document;

@Schema()
export class Token {
    @Prop({type: String})
    user: any;
    @Prop({type: String})
    token: any;
    @Prop({type: String})
    client_type: any;
    @Prop({type: String})
    scope: any;
    @Prop({type: Object})
    refresh_tokens: any
}

export const TokenSchema = SchemaFactory.createForClass(Token);
