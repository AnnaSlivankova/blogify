import {BlogModel} from "./blog/blog-schema";
import {PostModel} from "./post/post-schema";
import {UserModel} from "./user/user-schema";
import {CommentModel} from "./comment/comment-schema";
import {DeviceAuthSessionsModel} from "./security-devices/device-auth-sessions-schema";
import {ApiRequestsHistoryModel} from "./security-devices/api-requests-history-schema";
import {LikeCommentStatusesModel} from "./comment/like-comment-statuses-schema";

export class TestingAllDataRepository {
  static async deleteAllData() {
    try {
      await Promise.all([
        BlogModel.deleteMany({}),
        PostModel.deleteMany({}),
        UserModel.deleteMany({}),
        CommentModel.deleteMany({}),
        DeviceAuthSessionsModel.deleteMany({}),
        ApiRequestsHistoryModel.deleteMany({}),
        LikeCommentStatusesModel.deleteMany({}),
      ])

      return
    } catch (e) {
      console.log('e', e)
      return
    }
  }
}